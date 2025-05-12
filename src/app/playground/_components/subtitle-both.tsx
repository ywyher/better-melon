'use client'

import { useState, useEffect, useRef } from 'react';
import { useQuery } from "@tanstack/react-query";
import { parseSubtitleToJson } from '@/lib/subtitle/parse';
import { getTokenizer } from 'kuromojin';

export default function SubtitlePlayground() {
  const [jpnFetchTime, setJpnFetchTime] = useState(0);
  const [hiraganaFetchTime, setHiraganaFetchTime] = useState(0);
  const [activeTab, setActiveTab] = useState('japanese');
  const [showBoth, setShowBoth] = useState(false);
  const startTimeRef = useRef<number>(0);
  const hiraganaStartTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const { data: jpnData, error: jpnError, isLoading: isJpnLoading } = useQuery({
    queryKey: ['subtitle-japanese'],
    queryFn: async () => {
      startTimeRef.current = Date.now();

      const fetchStart = performance.now()
      
      const subs = await parseSubtitleToJson({
        source: "https://jimaku.cc/entry/1310/download/%5BJudas%5D%20Steins%3BGate%20-%20S01E01.srt",
        format: 'srt',
        transcription: 'japanese'
      });

      const fetchEnd = performance.now()

      console.info(`~Query Japanese subtitle parsing took: ${fetchEnd - fetchStart}ms`)
      return subs;
    },
    staleTime: 60 * 1000, // Cache for 1 minute
    gcTime: 5 * 60 * 1000 // Keep in garbage collection for 5 minutes
  });

  const { data: hiraganaData, error: hiraganaError, isLoading: isHiraganaLoading } = useQuery({
    queryKey: ['subtitle-hiragana'],
    queryFn: async () => {
      hiraganaStartTimeRef.current = Date.now();

      const fetchStart = performance.now()
      
      const subs = await parseSubtitleToJson({
        source: "https://jimaku.cc/entry/1310/download/%5BJudas%5D%20Steins%3BGate%20-%20S01E01.srt",
        format: 'srt',
        transcription: 'hiragana'
      });

      const fetchEnd = performance.now()

      console.info(`~Query Hiragana subtitle parsing took: ${fetchEnd - fetchStart}ms`)
      return subs;
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!jpnData // Only fetch hiragana after Japanese data is available
  });

  useEffect(() => {
    if(jpnData && !isJpnLoading && startTimeRef.current) {
      const endTime = Date.now();
      setJpnFetchTime((endTime - startTimeRef.current) / 1000);
    }
  }, [jpnData, isJpnLoading]);

  useEffect(() => {
    if(hiraganaData && !isHiraganaLoading && hiraganaStartTimeRef.current) {
      const endTime = Date.now();
      setHiraganaFetchTime((endTime - hiraganaStartTimeRef.current) / 1000);
    }
  }, [hiraganaData, isHiraganaLoading]);

  if (isJpnLoading) {
    return (
      <div className="flex items-center justify-center h-96 rounded-lg bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400 dark:border-r-gray-800 align-middle"></div>
          <p className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Loading Japanese subtitles...</p>
        </div>
      </div>
    );
  }

  if (jpnError) {
    return (
      <div className="p-6 rounded-lg border bg-red-50 border-red-200 text-red-600 dark:bg-red-900 dark:border-red-700 dark:text-red-200">
        <h2 className="text-xl font-bold mb-2 text-red-700 dark:text-red-300">Error Loading Japanese Subtitles</h2>
        <p>{jpnError.message || "An unknown error occurred"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-black dark:text-white">
      <div className="p-4 mb-6 rounded-lg border bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-300">Subtitle Playground</h1>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 rounded-md bg-blue-600 text-white dark:bg-blue-800 dark:text-blue-200">
              Japanese: <span className="font-bold">{jpnFetchTime.toFixed(2)}s</span>
            </div>
            {hiraganaFetchTime > 0 && (
              <div className="px-4 py-2 rounded-md bg-green-600 text-white dark:bg-green-800 dark:text-green-200">
                Hiragana: <span className="font-bold">{hiraganaFetchTime.toFixed(2)}s</span>
              </div>
            )}
          </div>
        </div>
        <p className="text-sm mt-2 text-blue-700 dark:text-blue-300">
          Source: Steins;Gate - S01E01
        </p>
      </div>

      {/* Tabs and Display Mode Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('japanese')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                      ${activeTab === 'japanese' ? 
                        'bg-white text-blue-700 shadow dark:bg-gray-800 dark:text-blue-400' : 
                        'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white'}`}
          >
            Japanese
          </button>
          <button
            onClick={() => setActiveTab('hiragana')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                      ${activeTab === 'hiragana' ? 
                        'bg-white text-green-700 shadow dark:bg-gray-800 dark:text-green-400' : 
                        'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white'}`}
            disabled={isHiraganaLoading || !hiraganaData}
          >
            Hiragana {isHiraganaLoading && '(Loading...)'}
          </button>
        </div>

        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={showBoth}
              onChange={() => setShowBoth(!showBoth)}
              disabled={isHiraganaLoading || !hiraganaData}
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              Show both
            </span>
          </label>
        </div>
      </div>

      {/* Subtitle Display */}
      <div className="grid gap-4">
        {jpnData && jpnData.map((cue) => {
          const hiraganaEntry = hiraganaData?.find(h => h.id === cue.id);
          
          return (
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
              
              {/* Japanese text - shown if either activeTab is japanese or showBoth is true */}
              {(activeTab === 'japanese' || showBoth) && (
                <p className="text-lg mb-2">{cue.content}</p>
              )}
              
              {/* Hiragana text - shown if either activeTab is hiragana or showBoth is true */}
              {(activeTab === 'hiragana' || showBoth) && hiraganaEntry && (
                <p className={`text-lg ${showBoth ? 'text-green-600 dark:text-green-400' : ''}`}>
                  {hiraganaEntry.content}
                </p>
              )}
              
              {/* Loading state for hiragana */}
              {(activeTab === 'hiragana' || showBoth) && isHiraganaLoading && (
                <p className="text-sm italic text-gray-500 dark:text-gray-400">Loading hiragana...</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}