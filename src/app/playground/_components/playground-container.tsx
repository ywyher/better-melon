"use client"

import { getCompleteData } from "@/app/watch/[id]/[ep]/actions"
import { playerQueries } from "@/lib/queries/player";
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export default function PlaygroundContainer() {
  const animeId = '21234';
  const episodeNumber = 8;

  const [queryTimes, setQueryTimes] = useState({
    data: { start: 0, end: 0 }
  });

  const {
    data: data,
    isLoading: isLoadingData,
    error: dataError,
  } = useQuery({
    ...playerQueries.episodeData(animeId, episodeNumber),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isLoadingData) {
      setQueryTimes(prev => ({
        ...prev,
        data: { ...prev.data, start: Date.now() }
      }));
    } else if (data && queryTimes.data.start > 0 && queryTimes.data.end === 0) {
      setQueryTimes(prev => ({
        ...prev,
        data: { ...prev.data, end: Date.now() }
      }));
    }
  }, [isLoadingData, data]);

  const getLoadingTime = (startTime: number, endTime: number) => {
    if (startTime === 0) return "Not started";
    if (endTime === 0) return "Loading...";
    return `${endTime - startTime}ms`;
  };
  
  const getQueryStatus = (isLoading: boolean, error: any, data: any) => {
    if (isLoading) return "Loading...";
    if (error) return "Error";
    if (data) return "Success";
    return "Idle";
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-900">
        <div className="bg-gray-800 shadow-lg rounded-lg p-6 max-w-3xl w-full">
            <h1 className="text-2xl font-bold mb-6 text-center text-white">
            Query Performance Tracker
            </h1>
            <div className="space-y-5">
              {/* Initial Anime Data Query */}
              <div className="border rounded-lg p-4 border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-300">
                      Initial Anime Data Query
                  </h2>
                  <span
                      className={`px-3 py-1 rounded-full text-sm ${
                      isLoadingData
                          ? 'bg-yellow-800 text-yellow-100'
                          : dataError
                          ? 'bg-red-800 text-red-100'
                          : data
                              ? 'bg-green-800 text-green-100'
                              : 'bg-gray-700 text-gray-300'
                      }`}
                  >
                      {getQueryStatus(isLoadingData, dataError, data)}
                  </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                  <div>
                      <p className="text-sm text-gray-500">Started at:</p>
                      <p className="font-mono text-gray-400">
                      {queryTimes.data.start > 0
                          ? new Date(queryTimes.data.start).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false,
                          })
                          : 'Not started'}
                      </p>
                  </div>
                  <div>
                      <p className="text-sm text-gray-500">Completed at:</p>
                      <p className="font-mono text-gray-400">
                      {queryTimes.data.end > 0
                          ? new Date(queryTimes.data.end).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false,
                          })
                          : isLoadingData
                          ? 'Loading...'
                          : 'Not completed'}
                      </p>
                  </div>
                  <div className="col-span-2">
                      <p className="text-sm text-gray-500">Time taken:</p>
                      <p className="font-mono font-bold text-lg text-gray-400">
                      {getLoadingTime(
                          queryTimes.data.start,
                          queryTimes.data.end,
                      )}
                      </p>
                  </div>
                  </div>
              </div>
              {/* Summary */}
              <div className="bg-gray-700 rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-2 text-gray-300">
                  Query Summary
                  </h2>
                  <div className="space-y-2">
                  <div className="flex justify-between">
                      <span className="text-gray-400">Initial Anime Data:</span>
                      <span className="font-mono text-gray-400">
                      {getLoadingTime(
                          queryTimes.data.start,
                          queryTimes.data.end,
                      )}
                      </span>
                  </div>
                  </div>
              </div>
            </div>
        </div>
    </div>
  );
}