import { SubtitleSettings } from "@/lib/db/schema";
import { subtitleQueries } from "@/lib/queries/subtitle";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { useTranscriptionStore } from "@/lib/stores/transcription-store";
import { getActiveSubtitleFile, getEnglishSubtitleUrl } from "@/lib/utils/subtitle";
import { NetworkCondition } from "@/types";
import { Anime } from "@/types/anime";
import { EpisodeData } from "@/types/episode";
import { ActiveSubtitleFile, SubtitleTranscription } from "@/types/subtitle";
import { useQueries } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

type PrefetchSubtitleTranscriptionsProps = {
  episodeData: EpisodeData | undefined,
  preferredFormat: SubtitleSettings["preferredFormat"],
  isReady: boolean,
  isLastEpisode: boolean,
  networkCondition: NetworkCondition
  animeId: Anime['id']
  episodeNumber: number
}

export function usePrefetchSubtitleTranscriptions({
  episodeData,
  preferredFormat,
  isReady,
  isLastEpisode,
  networkCondition,
  animeId,
  episodeNumber
}: PrefetchSubtitleTranscriptionsProps) {
  const storeActiveTranscriptions = useTranscriptionStore((state) => state.activeTranscriptions) || [];

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
          getActiveSubtitleFile({
            files: episodeData.subtitles ?? [],
            preferredFormat,
          }) : 
          undefined;
      } catch (error) {
        activeSubtitleFile = undefined;
      }
      
      try {
        englishSubtitleUrl = episodeData ? 
          getEnglishSubtitleUrl({
            files: episodeData.sources?.tracks ?? [],
          }) : 
          '';
      } catch (error) {
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