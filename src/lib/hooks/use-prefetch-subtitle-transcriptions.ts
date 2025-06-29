import { SubtitleSettings } from "@/lib/db/schema";
import { subtitleQueries } from "@/lib/queries/subtitle";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { getActiveSubtitleFile, getEnglishSubtitleUrl } from "@/lib/utils/subtitle";
import { NetworkCondition } from "@/types";
import { AnimeEpisodeData } from "@/types/anime";
import { ActiveSubtitleFile, SubtitleTranscription } from "@/types/subtitle";
import { useQueries } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

type PrefetchSubtitleTranscriptionsProps = {
  episodeNumber: number,
  episodeData: AnimeEpisodeData | undefined,
  preferredFormat: SubtitleSettings["preferredFormat"],
  isReady: boolean,
  isLastEpisode: boolean,
  networkCondition: NetworkCondition
}

export function usePrefetchSubtitleTranscriptions({
  episodeNumber,
  episodeData,
  preferredFormat,
  isReady,
  isLastEpisode,
  networkCondition
}: PrefetchSubtitleTranscriptionsProps) {
  const storeActiveTranscriptions = useSubtitleStore((state) => state.activeTranscriptions) || [];

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
        activeSubtitleFile = episodeData ? 
          getActiveSubtitleFile(episodeData.subtitles ?? [], preferredFormat) : 
          undefined;
      } catch (error) {
        console.debug(`Skipping subtitle prefetch for episode ${episodeNumber}, transcription ${transcription}: no suitable subtitle file`);
        activeSubtitleFile = undefined;
      }
      
      try {
        englishSubtitleUrl = episodeData ? 
          getEnglishSubtitleUrl(episodeData.sources?.tracks ?? []) : 
          '';
      } catch (error) {
        console.debug(`Skipping English subtitle prefetch for episode ${episodeNumber}: no English track available`);
        englishSubtitleUrl = '';
      }
      
      return {
        ...subtitleQueries.transcriptions({
          activeSubtitleFile,
          englishSubtitleUrl,
          isEnglish,
          isTokenizerInitialized: true,
          transcription
        }),
        staleTime: 1000 * 60 * 60,
        enabled: !!shouldFetchSubtitles && 
                !!episodeData != null && 
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