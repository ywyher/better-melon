import { TranscriptionQuery } from "@/app/watch/[id]/[ep]/types";
import { useTokenizer } from "@/lib/hooks/use-initialize-tokenizer";
import { usePlayerStore } from "@/lib/stores/player-store";
import { parseSubtitleToJson } from "@/lib/subtitle/parse";
import { getSubtitleFormat, getSubtitleSource } from "@/lib/subtitle/utils";
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

  // Use the tokenizer hook
  const { isInitialized: isTokenizerInitialized, isLoading: isTokenizerLoading, error: tokenizerError } = useTokenizer();
  
  const hookStartTime = useRef<number>(performance.now());
  const [loadingDuration, setLoadingDuration] = useState<number | null>(null);

  const queryConfig = useMemo(() => ({
    queries: activeTranscriptions.map(transcription => {
      const isEnglish = transcription === 'english';

      console.debug(`is ready`, isTokenizerInitialized && (
        (isEnglish && !!englishSubtitleUrl) || 
        (!isEnglish && !!activeSubtitleFile)
      ))
      
      return {
        queryKey: [
          'subtitle',
          'transcriptions',
          transcription,
          activeSubtitleFile
        ],
        queryFn: async () => {
          if ((isEnglish && !englishSubtitleUrl) 
            || (!isEnglish && !activeSubtitleFile)) {
            throw new Error(`Couldn't get the file for ${transcription} subtitles`);
          }

          if (!activeSubtitleFile) {
            throw new Error(`Active subtitle file is null`);
          }
          
          if (!isTokenizerInitialized) {
            throw new Error(`tokenizer isn't initialized`);
          }
          
          const startQuery = performance.now();
          console.info(`~Starting query for ${transcription} subtitles...`);
          
          const source = getSubtitleSource(isEnglish, englishSubtitleUrl, activeSubtitleFile);
          const format = getSubtitleFormat(isEnglish, englishSubtitleUrl, activeSubtitleFile);
          
          const cues = await parseSubtitleToJson({
            source,
            format,
            transcription
          });
          
          const endQuery = performance.now();
          console.info(`~Query for ${transcription} subtitles completed in ${(endQuery - startQuery).toFixed(2)}ms`);

          console.debug(`hook fuck`, cues)
          
          return {
            transcription,
            format,
            cues
          };
        },
        staleTime: 1000 * 60 * 60,
        enabled: isTokenizerInitialized && (
          (isEnglish && !!englishSubtitleUrl) || 
          (!isEnglish && !!activeSubtitleFile)
        ),
      };
    })
  }), [englishSubtitleUrl, activeSubtitleFile, activeTranscriptions, isTokenizerInitialized]);

  const subtitleQueries = useQueries(queryConfig);

  // Calculate total execution time when all queries are done
  useEffect(() => {
    const allQueriesFinished = subtitleQueries.every(
      query => !query.isLoading && (query.isSuccess || query.isError)
    );

    if (allQueriesFinished && subtitleQueries.length > 0 && !loadingDuration) {
      const endTime = performance.now();
      const executionTime = endTime - hookStartTime.current;
      setLoadingDuration(executionTime);
      console.debug(`~Total hook execution time: ${executionTime.toFixed(2)}ms`);
    }
  }, [subtitleQueries, loadingDuration]);

  // Combine the tokenizer and subtitle loading states
  const transcriptions = subtitleQueries.map((q) => {
    if (!q.data) return;
    return {
      transcription: q.data.transcription,
      format: q.data.format,
      cues: q.data.cues,
    };
  });
  const japanese = transcriptions.find(t => t?.transcription === 'japanese');

  const isLoading = isTokenizerLoading || subtitleQueries.some(q => q.isLoading);
  const error = tokenizerError || subtitleQueries.find(q => q.error)?.error || !japanese;

  
  return {
    isLoading,
    error,
    transcriptions: subtitleQueries.map((q) => {
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
