import { GET_ANIME_DYNAMIC_DATA } from "@/lib/graphql/queries";
import { Anime } from "@/types/anime";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { QueryResult, useQuery as useApolloQuery } from "@apollo/client";
import { animeQueries } from "@/lib/queries/anime";
import { AnilistResponse } from "@/types/anilist";

export function useAnimeData(animeId: string) {
  const { 
    data: staticData, 
    isLoading: isStaticLoading, 
    error: staticError,
    refetch: refetchStatic
  }: UseQueryResult<AnilistResponse<"Media", Anime>, Error> = useQuery({
    ...animeQueries.staticData(animeId),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
    retry: 3,
  })

  const {
    data: dynamicData,
    loading: isDynamicLoading, 
    error: dynamicError,
    refetch: refetchDynamic
  }:  QueryResult<AnilistResponse<"Media", Anime>> = useApolloQuery(GET_ANIME_DYNAMIC_DATA, { variables: { id: Number(animeId) }, fetchPolicy: 'cache-first', });

  return {
    animeData: {
      ...staticData?.Media,
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