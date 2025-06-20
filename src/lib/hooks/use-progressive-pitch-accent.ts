import { useCallback, useEffect, useRef, useState } from 'react';
import { SubtitleCue } from '@/types/subtitle';
import { NHKEntry } from '@/types/nhk';
import { chunkArray } from '@/lib/utils/utils';
import { getPitchAccent } from '@/lib/db/queries';

const config = {
  chunkSize: 400,
  delayBetweenRequests: 100,
};

interface PitchLoadingState {
  totalSubtitles: number;
  processedSubtitles: number;
  isComplete: boolean;
  isLoading: boolean;
  error?: Error;
}

export function useProgressivePitchAccent(japaneseCues: SubtitleCue[] = []) {
  const [pitchLookup, setPitchLookup] = useState<Map<string, NHKEntry>>(new Map());
  const [loadingState, setLoadingState] = useState<PitchLoadingState>({
    totalSubtitles: 0,
    processedSubtitles: 0,
    isComplete: false,
    isLoading: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const hookStartTime = useRef<number>(performance.now());
  const [loadingDuration, setLoadingDuration] = useState<number>(0);

  const createChunks = useCallback((cues: SubtitleCue[]) => {
    const tokens = cues.flatMap((c) =>
      c.tokens?.flatMap((t) => t.original_form ?? []) ?? []
    ).filter(Boolean);
    console.log("pitch tokens", tokens);
    const deduplicatedTokens = Array.from(new Set(tokens));
    const chunks = chunkArray(deduplicatedTokens, config.chunkSize);
    console.log("pitch chunks", `http://localhost:6969/api/pitch/search/${chunks[0]?.join(',')}`);
    return chunks;
  }, []);

  const processChunksSequentially = useCallback(async (chunks: string[][]) => {
    // Cancel any existing processing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoadingState({
      totalSubtitles: chunks.length,
      processedSubtitles: 0,
      isComplete: false,
      isLoading: true,
    });

    try {
      for (let i = 0; i < chunks.length; i++) {
        // Check if operation was aborted
        if (abortController.signal.aborted) {
          return;
        }

        const chunk = chunks[i];
        const query = chunk.join(',');
        
        try {
          const entries = await getPitchAccent(query);
          
          // Update the lookup map
          setPitchLookup(prev => {
            const newMap = new Map(prev);
            entries.forEach(entry => {
              // Assuming NHKEntry has a 'word' or 'text' property to use as key
              // Adjust this based on your NHKEntry structure
              if (entry.word) {
                newMap.set(entry.word, entry);
              }
            });
            return newMap;
          });

          // Update progress
          setLoadingState(prev => ({
            ...prev,
            processedSubtitles: i + 1,
          }));

          // Add delay between requests (except for the last one)
          if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests));
          }
        } catch (error) {
          console.error(`Error processing chunk ${i}:`, error);
          // Continue with next chunk instead of failing completely
        }
      }

      // Mark as complete
      setLoadingState(prev => ({
        ...prev,
        isComplete: true,
        isLoading: false,
      }));

      // Calculate and set loading duration
      if (!loadingDuration) {
        const endTime = performance.now();
        const executionTime = endTime - hookStartTime.current;
        setLoadingDuration(executionTime);
        console.debug(`~Progressive pitch accent loading time: ${executionTime.toFixed(2)}ms`);
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        setLoadingState(prev => ({
          ...prev,
          error: error instanceof Error ? error : undefined,
          isLoading: false,
        }));
      }
    }
  }, []);

  const startProcessing = useCallback(() => {
    if (!japaneseCues.length) return;
    
    setLoadingDuration(0);
    const chunks = createChunks(japaneseCues);
    if (chunks && chunks.length > 0) {
      hookStartTime.current = performance.now();
      processChunksSequentially(chunks);
    }
  }, [japaneseCues, createChunks, processChunksSequentially]);

  useEffect(() => {
    startProcessing();
  }, [startProcessing]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const { isComplete, isLoading, processedSubtitles, totalSubtitles, error } = loadingState;
  
  return {
    pitchLookup,
    isComplete,
    isLoading,
    processedSubtitles,
    totalSubtitles,
    error,
    loadingDuration,
    startProcessing, // Allow manual restart if needed
  };
}