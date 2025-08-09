import { SubtitleSettings } from "@/lib/db/schema";
import { useNetworkCondition } from "@/lib/hooks/use-network-condition";
import { usePrefetchPitchAccent } from "@/lib/hooks/use-prefetch-pitch-accent";
import { usePrefetchStreamingData } from "@/lib/hooks/use-prefetch-streaming-data";
import { usePrefetchSubtitleStyles } from "@/lib/hooks/use-prefetch-subtitle-styles";
import { usePrefetchSubtitleTranscriptions } from "@/lib/hooks/use-prefetch-subtitle-transcriptions";
import { usePlayerStore } from "@/lib/stores/player-store";
import { Anime } from "@/types/anime";
import { StreamingData } from "@better-melon/shared/types";
import { useMediaState } from "@vidstack/react";
import { useEffect, useMemo, useRef, useState } from "react";

type PrefetchEpisodeProps = {
  animeId: Anime['id'],
  episodeNumber: number,
  streamingData: StreamingData | null,
  preferredFormat: SubtitleSettings["preferredFormat"],
}

export function usePrefetchEpisode({
  animeId,
  episodeNumber,
  streamingData,
  preferredFormat,
}: PrefetchEpisodeProps) {
  const isVideoReady = usePlayerStore((state) => state.isVideoReady);
  const isLastEpisode = (streamingData?.anime.episodes || 0) > 0 && episodeNumber >= (streamingData?.anime.episodes || 0);
  const player = usePlayerStore((state) => state.player)
  const isPaused = useMediaState('paused', player)
  const [passedHalfDuration, setPassedHalfDuration] = useState<boolean>(false)
  const lastUpdateTimeRef = useRef<number>(0);
  
  useEffect(() => { 
    if(!player.current || passedHalfDuration) return;

    return player.current.subscribe(({ currentTime, duration }) => {
        const now = Date.now();
        if (now - lastUpdateTimeRef.current > 250) {
          lastUpdateTimeRef.current = now;
          
          if(Number(currentTime) > Number(duration/2)) {
              setPassedHalfDuration(true)
          }
        }
    });
  }, [player, passedHalfDuration])

  const isReady = useMemo(() => {
    if(!streamingData || !preferredFormat || !passedHalfDuration || isPaused) return false;
    const shared = isVideoReady &&
        preferredFormat &&
        passedHalfDuration;

    if(streamingData.anime.nextAiringEpisode) {
      return shared &&
        streamingData.anime.nextAiringEpisode?.episode != episodeNumber + 1
    }else {
      return shared &&
        streamingData.anime.episodes != episodeNumber
    };
  }, [isVideoReady, streamingData, preferredFormat, passedHalfDuration, episodeNumber, isPaused])

  const networkCondition = useNetworkCondition();
  
  const { 
    streamingData: prefetchedStreamingData, 
  } = usePrefetchStreamingData({
    animeId, 
    episodeNumber, 
    isReady, 
    isLastEpisode, 
    networkCondition
  });
  
  const { 
    subtitlesPrefetched, 
    activeTranscriptions,
    subtitleQueries
  } = usePrefetchSubtitleTranscriptions({
    streamingData: prefetchedStreamingData,
    preferredFormat,
    isReady,
    isLastEpisode,
    networkCondition,
    animeId,
    episodeNumber
  });
  
  const { 
    stylesPrefetched, 
  } = usePrefetchSubtitleStyles({
    activeTranscriptions,
    isLastEpisode,
    isReady,
    networkCondition
  });

  const {
    pitchAccentPrefetched
  } = usePrefetchPitchAccent({
    animeId,
    streamingData,
    japaneseCues: subtitleQueries?.find(q => q.data?.transcription == 'japanese')?.data?.cues,
    isLastEpisode,
    isReady,
    networkCondition,
    preferredFormat,
  })

  return {
    isLastEpisode,
    subtitlesPrefetched,
    stylesPrefetched,
    pitchAccentPrefetched,
    networkCondition
  };
}