import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SubtitleCue } from '@/types/subtitle';
import { NHKEntry } from '@/types/nhk';
import { chunkArray } from '@/lib/utils/utils';
import { useSubtitleStore } from '@/lib/stores/subtitle-store';
import { useQueries } from '@tanstack/react-query';
import { pitchQueries } from '@/lib/queries/pitch';

const config = {
  chunkSize: 200,
  delayBetweenRequests: 100,
};

export function usePitchAccentChunks(japaneseCues: SubtitleCue[] = [], animeId: string) {
  const activeSubtitleFile = useSubtitleStore((state) => state.activeSubtitleFile)
  const [pitchLookup, setPitchLookup] = useState<Map<string, NHKEntry>>(new Map());
  const hookStartTime = useRef<number>(performance.now());
  const [loadingDuration, setLoadingDuration] = useState<number>(0);

  const chunks = useMemo(() => {
    if (!japaneseCues.length) return [];
    
    const tokens = japaneseCues.flatMap((c) =>
      c.tokens?.flatMap((t) => t.original_form ?? []) ?? []
    ).filter(Boolean);
    
    console.log("pitch tokens", tokens);
    const deduplicatedTokens = Array.from(new Set(tokens));
    const chunkedTokens = chunkArray(deduplicatedTokens, config.chunkSize);
    console.log("pitch chunks", chunkedTokens.length);
    
    return chunkedTokens;
  }, [japaneseCues]);

  const queryConfig = useMemo(() => ({
    queries: chunks.map((chunk, index) => {
      return {
        ...pitchQueries.accentChunk(
          chunk,
          index,
          animeId, 
          activeSubtitleFile?.file.name || "",
          config.delayBetweenRequests
        ),
        staleTime: 1000 * 60 * 60,
        enabled: !!activeSubtitleFile && !!animeId && !!chunk.length,
      }
    })
  }), [chunks, activeSubtitleFile, animeId]);

  const queries = useQueries(queryConfig);

  const loadingState = useMemo(() => {
    const totalChunks = queries.length;
    const processedChunks = queries.filter(q => q.isSuccess || q.isError).length;
    const isLoading = queries.some(q => q.isLoading);
    const isComplete = totalChunks > 0 && processedChunks === totalChunks;
    const error = queries.find(q => q.error)?.error as Error | undefined;

    return {
      totalChunks,
      processedChunks,
      isComplete,
      isLoading,
      error,
    };
  }, [queries]);

  useEffect(() => {
    const newLookup = new Map<string, NHKEntry>();
    
    queries.forEach(query => {
      if (query.data) {
        query.data.forEach(entry => {
          if (entry.word) {
            newLookup.set(entry.word, entry);
          }
        });
      }
    });

    setPitchLookup(newLookup);
  }, [queries.map(q => q.data).join(',')]); // Stable dependency

  useEffect(() => {
    if (loadingState.isComplete && !loadingDuration && queries.length > 0) {
      const endTime = performance.now();
      const executionTime = endTime - hookStartTime.current;
      setLoadingDuration(executionTime);
      console.debug(`~Progressive pitch accent loading time: ${executionTime.toFixed(2)}ms`);
    }
  }, [loadingState.isComplete, loadingDuration, queries.length]);

  // Reset timing when starting new processing
  useEffect(() => {
    if (loadingState.isLoading && loadingDuration > 0) {
      setLoadingDuration(0);
      hookStartTime.current = performance.now();
    }
  }, [loadingState.isLoading, loadingDuration]);

  const refetchAll = useCallback(() => {
    queries.forEach(query => {
      if (query.refetch) query.refetch();
    });
  }, [queries]);

  return {
    pitchLookup,
    isComplete: loadingState.isComplete,
    isLoading: loadingState.isLoading,
    processedChunks: loadingState.processedChunks,
    totalChunks: loadingState.totalChunks,
    error: loadingState.error,
    loadingDuration,
    refetchAll, // Allow manual restart if needed
  };
}