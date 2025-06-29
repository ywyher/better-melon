import { GET_ANIME_DYNAMIC_DATA } from "@/lib/graphql/queries";
import { Anime } from "@/types/anime";
import { useQuery } from "@tanstack/react-query";
import { useQuery as useApolloQuery } from "@apollo/client";
import { animeQueries } from "@/lib/queries/anime";
import { useEffect } from "react";

export function useAnimeData(animeId: string) {
  const { 
    data: staticData, 
    isLoading: isStaticLoading, 
    error: staticError,
    refetch: refetchStatic
  } = useQuery({
    ...animeQueries.data(animeId),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
    retry: 3,
  });

  const {
    loading: isDynamicLoading, 
    error: dynamicError,
    data: dynamicData,
    refetch: refetchDynamic
  } = useApolloQuery(GET_ANIME_DYNAMIC_DATA, { variables: { id: Number(animeId) }, fetchPolicy: 'cache-first', });

  return {
    animeData: {
      ...staticData?.data?.Media,
      ...dynamicData?.Media,
    } as Anime,
    isLoading: isStaticLoading || isDynamicLoading,
    error: staticError || dynamicError,
    refetch: () => {
      refetchDynamic()
      refetchStatic()
    },
  };
}