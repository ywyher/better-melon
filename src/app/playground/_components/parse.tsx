'use client'

import { useState, useEffect, useRef } from 'react';
import { useQuery } from "@tanstack/react-query";
import { parseSubtitleToJson } from '@/lib/subtitle/parse';
import { Button } from '@/components/ui/button';

export default function ParsePlayground() {
  const [fetchTime, setFetchTime] = useState(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['subtitle'],
    queryFn: async () => {
      startTimeRef.current = Date.now();

      const fetchStart = performance.now()
      
      const subs = await parseSubtitleToJson({
        source: "https://jimaku.cc/entry/1310/download/%5BJudas%5D%20Steins%3BGate%20-%20S01E01.srt",
        format: 'srt',
        transcription: 'hiragana'
      });

      const fetchEnd = performance.now()
      console.info(`~Query Subtitle parsing took: ${fetchEnd - fetchStart}ms`)
      
      return subs;
    },
    staleTime: 0,
    gcTime: 0
  });

  useEffect(() => {
    if(data && !isLoading && startTimeRef.current) {
      const endTime = Date.now();
      setFetchTime((endTime - startTimeRef.current) / 1000);
    }
  }, [data, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 rounded-lg bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400 dark:border-r-gray-800 align-middle"></div>
          <p className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Loading subtitles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg border bg-red-50 border-red-200 text-red-600 dark:bg-red-900 dark:border-red-700 dark:text-red-200">
        <h2 className="text-xl font-bold mb-2 text-red-700 dark:text-red-300">Error Loading Subtitles</h2>
        <p>{error.message || "An unknown error occurred"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-black dark:text-white">
      <div className="p-4 mb-6 rounded-lg border bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700">
        <div className="flex justify-between items-center">
          <h1 className="flex flex-row gap-3 text-2xl font-bold text-blue-800 dark:text-blue-300">
            Subtitle Playground
            <Button
              variant='outline'
              onClick={() => refetch()}
            >
              Refetch
            </Button>
          </h1>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 rounded-md bg-blue-600 text-white dark:bg-blue-800 dark:text-blue-200">
              Fetch Time: <span className="font-bold">{fetchTime.toFixed(2)}s</span>
            </div>
            {/* We can remove the dark mode toggle button if we are only relying on system preference */}
            {/* If you still want a toggle, you'll need to manage the dark mode state externally or with a different library */}
          </div>
        </div>
        <p className="text-sm mt-2 text-blue-700 dark:text-blue-300">
          Source: Steins;Gate - S01E01
        </p>
      </div>

      <div className="grid gap-4">
        {data && data.map((cue) => (
          <div
            key={cue.id}
            className="p-4 rounded-lg shadow-md border-l-4 hover:shadow-lg transition-shadow
                       bg-white border-blue-500 hover:shadow-gray-300
                       dark:bg-gray-800 dark:border-blue-600 dark:hover:shadow-blue-900/30"
          >
            <div className="flex justify-between mb-2">
              <span className="text-xs font-mono px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">#{cue.id}</span>
              <span className="text-xs font-mono px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {cue.from} → {cue.to}
              </span>
            </div>
            <p className="text-lg">{cue.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
