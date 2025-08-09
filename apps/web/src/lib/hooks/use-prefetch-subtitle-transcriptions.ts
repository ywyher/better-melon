import { SubtitleSettings } from "@/lib/db/schema";
import { subtitleQueries } from "@/lib/queries/subtitle";
import { useTranscriptionStore } from "@/lib/stores/transcription-store";
import { getActiveSubtitleFile, getEnglishSubtitleUrl } from "@/lib/utils/subtitle";
import { NetworkCondition } from "@/types";
import { Anime } from "@/types/anime";
import { ActiveSubtitleFile, SubtitleTranscription } from "@/types/subtitle";
import { StreamingData } from "@better-melon/shared/types";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

type PrefetchSubtitleTranscriptionsProps = {
  streamingData: StreamingData | undefined,
  preferredFormat: SubtitleSettings["preferredFormat"],
  isReady: boolean,
  isLastEpisode: boolean,
  networkCondition: NetworkCondition
  animeId: Anime['id']
  episodeNumber: number
}

export function usePrefetchSubtitleTranscriptions({
  streamingData,
  preferredFormat,
  isReady,
  isLastEpisode,
  networkCondition,
  animeId,
  episodeNumber
}: PrefetchSubtitleTranscriptionsProps) {
  const storeActiveTranscriptions = useTranscriptionStore((state) => state.activeTranscriptions);

  const activeTranscriptions: SubtitleTranscription[] = useMemo(() => {
    if (!storeActiveTranscriptions.includes('japanese')) {
      return [...storeActiveTranscriptions, 'japanese'];
    }
    return storeActiveTranscriptions;
  }, [storeActiveTranscriptions]);

  const shouldFetchSubtitles = useMemo(() => {
    return isReady && 
           !isLastEpisode && 
           networkCondition !== 'poor';
  }, [isReady, isLastEpisode, networkCondition]);

  const queries = useQueries({
    queries: activeTranscriptions.map((transcription) => {
      const isEnglish = transcription === 'english';
      
      let activeSubtitleFile: ActiveSubtitleFile | undefined;
      let englishSubtitleUrl = '';
      
      try {
        activeSubtitleFile = streamingData ? 
          getActiveSubtitleFile({
            files: streamingData.episode.subtitles ?? [],
            preferredFormat,
          }) : 
          undefined;
      } catch {
        activeSubtitleFile = undefined;
      }
      
      try {
        englishSubtitleUrl = streamingData ? 
          getEnglishSubtitleUrl({
            files: streamingData.episode.sources?.tracks ?? [],
          }) : 
          '';
      } catch {
        englishSubtitleUrl = '';
      }
      
      return {
        ...subtitleQueries.transcriptions({
          activeSubtitleFile,
          englishSubtitleUrl,
          isEnglish,
          shouldFetch: true,
          transcription,
          animeId,
          episodeNumber
        }),
        staleTime: 1000 * 60 * 60,
        enabled: !!shouldFetchSubtitles && 
                !!streamingData != null && 
                (
                  (isEnglish && !!englishSubtitleUrl) || 
                  (!isEnglish && !!activeSubtitleFile)
                )
      };
    })
  });
  
  const subtitlesPrefetched = useMemo(() => {
    if (queries.length === 0) return false;
    return queries.every(query => query.isSuccess);
  }, [queries]);

  return {
    subtitlesPrefetched,
    activeTranscriptions,
    subtitleQueries: queries
  };
}