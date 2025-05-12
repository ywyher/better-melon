'use client'
import LoadingButton from "@/components/loading-button";
import { initializeTokenizer, parseSubtitleToJson } from "@/lib/subtitle/parse";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type TranscriptionType = 'japanese' | 'hiragana' | 'katakana' | 'romaji' | 'english';

interface SubtitleData {
  data: any[];
  processingTime: number;
}

export default function SubtitleCache() {
  const [japaneseSubtitleUrl] = useState('https://jimaku.cc/entry/1310/download/%5BJudas%5D%20Steins%3BGate%20-%20S01E02.srt');
  const [englishSubtitleUrl] = useState("https://s.megastatics.com/subtitle/92580649ff01096b4a0de6428f58bedb/eng-0.vtt");
  
  // Track enabled state for each transcription type
  const [enabledTranscriptions, setEnabledTranscriptions] = useState<Record<TranscriptionType, boolean>>({
    japanese: false,
    hiragana: false,
    katakana: false,
    romaji: false,
    english: false
  });

  useEffect(() => {
    (async () => {
      await initializeTokenizer('prefetch');
    })();
  }, []);

  // Helper function to create query for each transcription type
  const createSubtitleQuery = (type: TranscriptionType) => {
    return useQuery({
      queryKey: [type],
      queryFn: async () => {
        const start = performance.now();
        const source = type === 'english' ? englishSubtitleUrl : japaneseSubtitleUrl;
        const format = type === 'english' ? 'vtt' : 'srt';
        
        const subs = await parseSubtitleToJson({
          source,
          format,
          transcription: type
        });
        
        const end = performance.now();
        const processingTime = parseFloat((end - start).toFixed(2));
        // console.info(`${type.charAt(0).toUpperCase() + type.slice(1)} ${enabledTranscriptions[type] ? "Refetch" : "Fetch"} took: ${processingTime}ms`);
        
        return {
          data: subs,
          processingTime
        } as SubtitleData;
      },
      enabled: !!enabledTranscriptions[type]
    });
  };

  // Create queries for all transcription types
  const japaneseQuery = createSubtitleQuery('japanese');
  const hiraganaQuery = createSubtitleQuery('hiragana');
  const katakanaQuery = createSubtitleQuery('katakana');
  const romajiQuery = createSubtitleQuery('romaji');
  const englishQuery = createSubtitleQuery('english');

  // Map queries to their respective types for easier access
  const queries: Record<TranscriptionType, ReturnType<typeof createSubtitleQuery>> = {
    japanese: japaneseQuery,
    hiragana: hiraganaQuery,
    katakana: katakanaQuery,
    romaji: romajiQuery,
    english: englishQuery
  };

  // Handle fetch/refetch for a specific transcription type
  const handleFetch = (type: TranscriptionType) => {
    if (enabledTranscriptions[type]) {
      queries[type].refetch();
    } else {
      setEnabledTranscriptions(prev => ({
        ...prev,
        [type]: true
      }));
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold">Subtitle Transcription Cache</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(queries).map(([type, query]) => (
          <div key={type} className="flex flex-col gap-2 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold capitalize">{type}</h2>
              {query.data && (
                <div className="text-sm border-1 px-2 py-1 rounded">
                  Processed in {query.data.processingTime}ms
                </div>
              )}
            </div>
            
            <LoadingButton
              onClick={() => handleFetch(type as TranscriptionType)}
              isLoading={query.isLoading}
            >
              {enabledTranscriptions[type as TranscriptionType] ? "Refetch" : "Fetch"} {type}
            </LoadingButton>
            
            {query.data && (
              <div className="mt-2 text-sm text-gray-600">
                Loaded {query.data.data.length} subtitle entries
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}