import { playerQueries } from "@/lib/queries/player";
import { NetworkCondition } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

type PrefetchEpisodeDataProps = {
  animeId: string,
  episodeNumber: number,
  isReady: boolean,
  isLastEpisode: boolean,
  networkCondition: NetworkCondition
}
export function usePrefetchEpisodeData({
  animeId,
  episodeNumber,
  isReady,
  isLastEpisode,
  networkCondition
}: PrefetchEpisodeDataProps) {
  const shouldFetchEpisodeData = useMemo(() => {
    return isReady &&
           !isLastEpisode && 
           networkCondition !== 'poor';
  }, [isReady, isLastEpisode, networkCondition]);
  
  const { 
    data: episodeData,
    isSuccess: episodeDataFetched,
    isFetching: isEpisodeDataFetching
  } = useQuery({
    ...playerQueries.episodeData(animeId, episodeNumber),
    staleTime: 1000 * 60 * 45,
    enabled: !!shouldFetchEpisodeData
  });

  // useEffect(() => {
  //   if (isEpisodeDataFetching) {
  //     console.info(`debug Started prefetching episode ${episodeNumber} data`);
  //   } else if (episodeDataFetched) {
  //     console.info(`debug Successfully prefetched episode ${episodeNumber} data`);
  //   }
  // }, [isEpisodeDataFetching, episodeDataFetched, episodeNumber]);

  return {
    episodeData,
    episodeDataPrefetched: episodeDataFetched,
    isEpisodeDataFetching
  };
}