import { streamingQueries } from "@/lib/queries/streaming";
import { NetworkCondition } from "@/types";
import { Anime } from "@/types/anime";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type PrefetchStreamingDataProps = {
  animeId: Anime['id'],
  episodeNumber: number,
  isReady: boolean,
  isLastEpisode: boolean,
  networkCondition: NetworkCondition
}
export function usePrefetchStreamingData({
  animeId,
  episodeNumber,
  isReady,
  isLastEpisode,
  networkCondition
}: PrefetchStreamingDataProps) {
  const shouldFetchStreamingData = useMemo(() => {
    return isReady &&
           !isLastEpisode && 
           networkCondition !== 'poor';
  }, [isReady, isLastEpisode, networkCondition]);
  
  const { 
    data: streamingData,
    isSuccess: streamingDataFetched,
    isFetching: isStreamingDataFetching
  } = useQuery({
    ...streamingQueries.data({
      animeId, 
      episodeNumber
    }),
    staleTime: 1000 * 60 * 45,
    enabled: !!shouldFetchStreamingData
  });

  // useEffect(() => {
  //   if (isStreamingDataFetching) {
  //     console.info(`debug Started prefetching episode ${episodeNumber} data`);
  //   } else if (streamingDataFetched) {
  //     console.info(`debug Successfully prefetched episode ${episodeNumber} data`);
  //   }
  // }, [isStreamingDataFetching, streamingDataFetched, episodeNumber]);

  return {
    streamingData,
    streamingDataPrefetched: streamingDataFetched,
    isStreamingDataFetching
  };
}