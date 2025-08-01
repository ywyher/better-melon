import { TranscriptionQuery } from "@/app/watch/[id]/[ep]/types";
import { subtitleQueries } from "@/lib/queries/subtitle";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { useTranscriptionStore } from "@/lib/stores/transcription-store";
import { getTranscriptionsLookupKey } from "@/lib/utils/subtitle";
import { Anime } from "@/types/anime";
import { SubtitleCue, SubtitleTranscription } from "@/types/subtitle";
import { useQueries } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UseSubtitleTranscriptionsProps = {
  shouldFetch: boolean,
  animeId: Anime['id'],
  episodeNumber: number
}

export const useSubtitleTranscriptions = ({
  shouldFetch,
  animeId,
  episodeNumber
}: UseSubtitleTranscriptionsProps) => {
  const englishSubtitleUrl = useSubtitleStore((state) => state.englishSubtitleUrl) || "";
  const activeSubtitleFile = useSubtitleStore((state) => state.activeSubtitleFile);
  const storeActiveTranscriptions = useTranscriptionStore((state) => state.activeTranscriptions) || [];

  // Ensure 'japanese', 'english', and 'hiragana' are always included in the active transcriptions
  const activeTranscriptions: SubtitleTranscription[] = useMemo(() => {
    const requiredTranscriptions: SubtitleTranscription[] = [];
    
    // Get unique transcriptions by combining required ones with existing ones
    const uniqueTranscriptions = Array.from(
      new Set([...storeActiveTranscriptions, ...requiredTranscriptions])
    );
    
    return uniqueTranscriptions;
  }, [storeActiveTranscriptions]);

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
          shouldFetch,
          transcription,
          animeId,
          episodeNumber
        }),
        staleTime: 1000 * 60 * 60,
        enabled: shouldFetch && (
          (isEnglish && !!englishSubtitleUrl) || 
          (!isEnglish && !!activeSubtitleFile)
        ),
        refetchOnWindowFocus: false,
      };
    })
  }), [englishSubtitleUrl, activeSubtitleFile, activeTranscriptions, shouldFetch]);

  const queries = useQueries({ ...queryConfig });

  useEffect(() => {
    const allQueriesFinished = queries.every(
      query => !query.isLoading && (query.isSuccess || query.isError)
    );

    if (allQueriesFinished && queries.length > 0 && !loadingDuration) {
      const endTime = performance.now();
      const executionTime = endTime - hookStartTime.current;
      console.log(`[SubtitleTranscriptionsParsing] Took -> ${executionTime.toFixed(2)}ms`)

      setLoadingDuration(executionTime);
    }
  }, [queries, loadingDuration]);
  
  const transcriptions = useMemo(() => {
    const result = queries.map((q) => {
      if(!q.data) return;
      return {
        transcription: q.data.transcription,
        format: q.data.format,
        cues: q.data.cues,
      }
    }).filter(q => q != undefined) as TranscriptionQuery[]
    
    return result;
  }, [queries.map(q => q.data).join(',')]); // More stable dependency

  const transcriptionsLookup = useMemo(() => {
    const lookup = new Map<SubtitleTranscription, Map<string, SubtitleCue>>();

    transcriptions.forEach(transcription => {
      if(!transcription) return
      const cueMap = new Map<string, SubtitleCue>();
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

  const refetchAll = useCallback(() => {
    queries.forEach((query) => {
      if (query.refetch) query.refetch();
    });
  }, [queries]);

  const isLoading = !shouldFetch || queries.some(q => q.isLoading);
  const error = queries.find(q => q.error)?.error;

  return {
    isLoading,
    error,
    transcriptions,
    transcriptionsLookup,
    loadingDuration: loadingDuration,
    refetch: refetchAll
  };
}