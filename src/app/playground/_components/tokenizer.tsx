'use client'

import { useInitializeTokenizer } from "@/lib/hooks/use-initialize-tokenizer";
import { useEffect } from "react";

export default function TokenizerPlayground() {
  const { 
    isInitialized,
    isLoading,
    initializationTime,
    initalize
  } = useInitializeTokenizer();

  useEffect(() => {
    if(isInitialized) return; 
    (async () => {
      await initalize()
    })()
  }, [initalize, isInitialized])

  return (
    <div className="flex flex-col gap-6 p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Tokenizer Playground</h1>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="font-medium">Initialized:</span>
            <span className={isInitialized ? "text-green-600" : "text-red-600"}>
              {isInitialized ? "Yes" : "No"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Loading:</span>
            <span className={isLoading ? "text-yellow-500" : "text-gray-500"}>
              {isLoading ? "Yes" : "No"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Initialization Time:</span>
            <span>{initializationTime ? `${initializationTime} ms` : "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}