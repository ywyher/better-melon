import { SubtitleSettings } from "@/lib/db/schema";
import { useNetworkCondition } from "@/lib/hooks/use-network-condition";
import { usePrefetchEpisodeData } from "@/lib/hooks/use-prefetch-episode-data";
import { usePrefetchPitchAccent } from "@/lib/hooks/use-prefetch-pitch-accent";
import { usePrefetchSubtitleStyles } from "@/lib/hooks/use-prefetch-subtitle-styles";
import { usePrefetchSubtitleTranscriptions } from "@/lib/hooks/use-prefetch-subtitle-transcriptions";
import { useEffect } from "react";

type PrefetchEpisodeProps = {
  animeId: string,
  episodeNumber: number,
  episodesLength: number,
  preferredFormat: SubtitleSettings["preferredFormat"],
  isReady: boolean
}

export function usePrefetchEpisode({
  animeId,
  episodeNumber,
  episodesLength,
  preferredFormat,
  isReady
}: PrefetchEpisodeProps) {
  const isLastEpisode = episodesLength > 0 && episodeNumber >= episodesLength;
  const networkCondition = useNetworkCondition();
  
  const { 
    episodeData, 
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
    episodeData,
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

  useEffect(() => {
    console.log(`prefetch isReady`, isReady)
  }, [isReady]);

  return {
    isLastEpisode,
    episodeDataPrefetched,
    subtitlesPrefetched,
    stylesPrefetched,
    pitchAccentPrefetched,
    networkCondition
  };
}