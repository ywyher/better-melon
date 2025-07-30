import { subtitleQueries } from "@/lib/queries/subtitle";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { NetworkCondition } from "@/types";
import { SubtitleTranscription } from "@/types/subtitle";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";

type PrefetchSubtitleStylesProps = {
  episodeNumber: number,
  activeTranscriptions: SubtitleTranscription[],
  isReady: boolean,
  isLastEpisode: boolean,
  networkCondition: NetworkCondition
}

export function usePrefetchSubtitleStyles({
  episodeNumber,
  activeTranscriptions,
  isReady,
  isLastEpisode,
  networkCondition
}: PrefetchSubtitleStylesProps) {
  const handleSubtitleStylesInStore = useSubtitleStylesStore((state) => state.handleStyles);
  const getStylesFromStore = useSubtitleStylesStore((state) => state.getStyles);
  const checkedTranscriptions = useRef<Set<SubtitleTranscription>>(new Set());

  const transcriptionsToFetch = useMemo(() => {
    if (!activeTranscriptions || activeTranscriptions.length === 0) return [];
    
    return activeTranscriptions.filter(transcription => {
      return !checkedTranscriptions.current.has(transcription);
    });
  }, [activeTranscriptions]);

  const shouldFetchStyles = useMemo(() => {
    const result = isReady && 
           !isLastEpisode && 
           networkCondition !== 'poor' &&
           transcriptionsToFetch.length > 0;
    
    return result;
  }, [isReady, isLastEpisode, networkCondition, transcriptionsToFetch]);

  // Add additional safety check - don't run query if basic conditions aren't met
  const queryEnabled = useMemo(() => {
    return shouldFetchStyles && 
           isReady && 
           !isLastEpisode && 
           networkCondition === 'good' &&
           transcriptionsToFetch.length > 0;
  }, [shouldFetchStyles, isReady, isLastEpisode, networkCondition, transcriptionsToFetch]);

  const {
    data: stylesQuery,
    isLoading: isStylesQueryLoading,
    isError: isStylesQueryError
  } = useQuery({
    ...subtitleQueries.styles({
      handleSubtitleStylesInStore,
      checkedTranscriptions,
      getStylesFromStore,
      transcriptionsToFetch,
    }),
    enabled: queryEnabled,
    // Add additional React Query options to prevent unwanted executions
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Only refetch if data is stale
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // useEffect(() => {
  //   if (!queryEnabled) return;
    
  //   if (isStylesQueryLoading) {
  //     console.info(`debug Started prefetching styles for episode ${episodeNumber}`);
  //   } else if (stylesQuery && !isStylesQueryError) {
  //     console.info(`debug Successfully prefetched styles for episode ${episodeNumber}`);
  //   } else if (isStylesQueryError) {
  //     console.warn(`debug Failed to prefetch styles for episode ${episodeNumber}`);
  //   }
  // }, [isStylesQueryLoading, stylesQuery, episodeNumber, isStylesQueryError, queryEnabled]);

  return {
    stylesPrefetched: !!(stylesQuery && !isStylesQueryError),
    isStylesQueryLoading: queryEnabled ? isStylesQueryLoading : false,
    queryEnabled
  };
}