import { TranscriptionQuery } from "@/app/watch/[id]/[ep]/types";
import { useInitializeTokenizer } from "@/lib/hooks/use-initialize-tokenizer";
import { subtitleQueries } from "@/lib/queries/subtitle";
import { usePlayerStore } from "@/lib/stores/player-store";
import { getTranscriptionsLookupKey } from "@/lib/subtitle/utils";
import { SubtitleCue, SubtitleTranscription } from "@/types/subtitle";
import { useQueries } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

export const useSubtitleTranscriptions = () => {
  const englishSubtitleUrl = usePlayerStore((state) => state.englishSubtitleUrl) || "";
  const activeSubtitleFile = usePlayerStore((state) => state.activeSubtitleFile);
  const storeActiveTranscriptions = usePlayerStore((state) => state.activeTranscriptions) || [];
  
  // Ensure 'japanese', 'english', and 'hiragana' are always included in the active transcriptions
  const activeTranscriptions: SubtitleTranscription[] = useMemo(() => {
    const requiredTranscriptions: SubtitleTranscription[] = ['japanese', 'english', 'hiragana'];
    
    // Get unique transcriptions by combining required ones with existing ones
    const uniqueTranscriptions = Array.from(
      new Set([...storeActiveTranscriptions, ...requiredTranscriptions])
    );
    
    return uniqueTranscriptions;
  }, [storeActiveTranscriptions]);

  const { initalize, isInitialized: isTokenizerInitialized, isLoading: isTokenizerLoading, error: tokenizerError } = useInitializeTokenizer();

  useEffect(() => {
    (async () => {
      await initalize()
    })()
  }, [initalize])

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
      if(!q.data) return;
      return {
        transcription: q.data.transcription,
        format: q.data.format,
        cues: q.data.cues,
      }
  }).filter(q => q != undefined) as TranscriptionQuery[]

  const transcriptionsLookup = useMemo(() => {
    const lookup = new Map<SubtitleTranscription, Map<string, SubtitleCue>>();

    transcriptions.forEach(transcription => {
      console.log(`transcription`, transcription)
      if(!transcription) return
      const cueMap = new Map<string, SubtitleCue>();
      console.log(transcription.cues)
      console.log(typeof transcription.cues)
      transcription.cues.forEach(cue => {
        if(cue.transcription == 'english') {
          // Apply English delay when storing
          cueMap.set(
            getTranscriptionsLookupKey(cue.from, cue.to), 
            cue
          );
        } else {
          // Apply Japanese delay when storing
          cueMap.set(
            getTranscriptionsLookupKey(cue.from, cue.to), 
            cue
          );
        }
      });
      lookup.set(transcription.transcription, cueMap);
    });
    
    return lookup;
  }, [transcriptions]);
  
  const refetchAll = () => {
    queries.forEach((query) => {
      if (query.refetch) query.refetch();
    });
  };

  const isLoading = isTokenizerLoading || queries.some(q => q.isLoading);
  const error = queries.find(q => q.error)?.error;

  return {
    isLoading,
    error,
    transcriptions,
    transcriptionsLookup,
    loadingDuration: loadingDuration,
    isTokenizerInitialized: isTokenizerInitialized,
    refetch: refetchAll
  };
}
