import { TranscriptionQuery } from "@/app/watch/[id]/[ep]/types";
import { useInitializeTokenizer } from "@/lib/hooks/use-initialize-tokenizer";
import { subtitleQueries } from "@/lib/queries/subtitle";
import { usePlayerStore } from "@/lib/stores/player-store";
import { SubtitleTranscription } from "@/types/subtitle";
import { useQueries } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

export const useSubtitleTranscriptions = () => {
  const englishSubtitleUrl = usePlayerStore((state) => state.englishSubtitleUrl) || "";
  const activeSubtitleFile = usePlayerStore((state) => state.activeSubtitleFile);
  const storeActiveTranscriptions = usePlayerStore((state) => state.activeTranscriptions) || [];
  
  // Ensure 'japanese' is always included in the active transcriptions
  const activeTranscriptions: SubtitleTranscription[] = useMemo(() => {
    // Check if 'japanese' is already included
    if (!storeActiveTranscriptions.includes('japanese')) {
      // If not, create a new array with 'japanese' added
      return [...storeActiveTranscriptions, 'japanese'];
    }
    // If 'japanese' is already included, use the original array
    return storeActiveTranscriptions;
  }, [storeActiveTranscriptions]);

  const { isInitialized: isTokenizerInitialized, isLoading: isTokenizerLoading, error: tokenizerError } = useInitializeTokenizer();

  useEffect(() => {
    console.debug(`debug isTokenizerInitialized ${isTokenizerInitialized}`)
  }, [isTokenizerInitialized])
  
  const hookStartTime = useRef<number>(performance.now());
  const [loadingDuration, setLoadingDuration] = useState<number>(0);

  const queryConfig = useMemo(() => ({
    queries: activeTranscriptions.map(transcription => {
      const isEnglish = transcription === 'english';
      
      return {
        ...subtitleQueries.transcriptions({
          activeSubtitleFile: activeSubtitleFile || undefined,
          englishSubtitleUrl,
          isEnglish,
          isTokenizerInitialized,
          transcription
        }),
        staleTime: 1000 * 60 * 60,
        enabled: isTokenizerInitialized && (
          (isEnglish && !!englishSubtitleUrl) || 
          (!isEnglish && !!activeSubtitleFile)
        ),
      };
    })
  }), [englishSubtitleUrl, activeSubtitleFile, activeTranscriptions, isTokenizerInitialized]);

  const queries = useQueries(queryConfig);

  // Calculate total execution time when all queries are done
  useEffect(() => {
    const allQueriesFinished = queries.every(
      query => !query.isLoading && (query.isSuccess || query.isError)
    );

    if (allQueriesFinished && queries.length > 0 && !loadingDuration) {
      const endTime = performance.now();
      const executionTime = endTime - hookStartTime.current;
      setLoadingDuration(executionTime);
      console.debug(`~Total hook execution time: ${executionTime.toFixed(2)}ms`);
    }
  }, [queries, loadingDuration]);

  // Combine the tokenizer and subtitle loading states
  const transcriptions = queries.map((q) => {
    if (!q.data) return;
    return {
      transcription: q.data.transcription,
      format: q.data.format,
      cues: q.data.cues,
    };
  });
  const japanese = transcriptions.find(t => t?.transcription === 'japanese');

  const isLoading = isTokenizerLoading || queries.some(q => q.isLoading);
  const error = tokenizerError || queries.find(q => q.error)?.error || !japanese;

  
  return {
    isLoading,
    error,
    transcriptions: queries.map((q) => {
      if(!q.data) return;
      return {
        transcription: q.data.transcription,
        format: q.data.format,
        cues: q.data.cues,
      }
    }).filter(q => q != undefined) as TranscriptionQuery[],
    loadingDuration: loadingDuration,
    isTokenizerInitialized: isTokenizerInitialized
  };
}
