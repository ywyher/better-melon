import { SubtitleSettings } from "@/lib/db/schema";
import { useNetworkCondition } from "@/lib/hooks/use-network-condition";
import { usePrefetchEpisodeData } from "@/lib/hooks/use-prefetch-episode-data";
import { usePrefetchPitchAccent } from "@/lib/hooks/use-prefetch-pitch-accent";
import { usePrefetchSubtitleStyles } from "@/lib/hooks/use-prefetch-subtitle-styles";
import { usePrefetchSubtitleTranscriptions } from "@/lib/hooks/use-prefetch-subtitle-transcriptions";
import { usePlayerStore } from "@/lib/stores/player-store";
import { AnimeEpisodeData } from "@/types/anime";
import { useEffect, useMemo, useRef, useState } from "react";

type PrefetchEpisodeProps = {
  animeId: string,
  episodeNumber: number,
  episodeData: AnimeEpisodeData | undefined,
  episodesLength: number,
  preferredFormat: SubtitleSettings["preferredFormat"],
}

export function usePrefetchEpisode({
  animeId,
  episodeNumber,
  episodeData,
  episodesLength,
  preferredFormat,
}: PrefetchEpisodeProps) {
  const isVideoReady = usePlayerStore((state) => state.isVideoReady);
  const isLastEpisode = episodesLength > 0 && episodeNumber >= episodesLength;
  const player = usePlayerStore((state) => state.player)
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
  }, [player])

  const isReady = useMemo(() => {
    if(!episodeData || !preferredFormat || !passedHalfDuration) return false;
    const shared = isVideoReady &&
        preferredFormat &&
        passedHalfDuration;

    if(episodeData.details.nextAiringEpisode) {
      return shared &&
        episodeData.details.nextAiringEpisode?.episode != episodeNumber + 1
    }else {
      return shared &&
        episodeData.details.episodes != episodeNumber
    };
  }, [isVideoReady, episodeData, preferredFormat, passedHalfDuration])

  const networkCondition = useNetworkCondition();
  
  const { 
    episodeData: prefetchedEpisodeData, 
    episodeDataPrefetched, 
  } = usePrefetchEpisodeData({
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
    episodeNumber,
    episodeData: prefetchedEpisodeData,
    preferredFormat,
    isReady,
    isLastEpisode,
    networkCondition
  });
  
  const { 
    stylesPrefetched, 
  } = usePrefetchSubtitleStyles({
    activeTranscriptions,
    episodeNumber,
    isLastEpisode,
    isReady,
    networkCondition
  });

  const {
    pitchAccentPrefetched
  } = usePrefetchPitchAccent({
    animeId,
    episodeData,
    japaneseCues: subtitleQueries?.find(q => q.data?.transcription == 'japanese')?.data?.cues,
    episodeNumber,
    isLastEpisode,
    isReady,
    networkCondition,
    preferredFormat,
  })

  return {
    isLastEpisode,
    episodeDataPrefetched,
    subtitlesPrefetched,
    stylesPrefetched,
    pitchAccentPrefetched,
    networkCondition
  };
}