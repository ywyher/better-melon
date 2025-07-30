import { Anime, AnimeQueryVariableKeys, AnimeQueryVariables } from "@/types/anime";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { animeQueries } from "@/lib/queries/anime";
import { AnilistResponse } from "@better-melon/shared/types";

type UseAnimeDataProps = {
  name: AnimeQueryVariableKeys;
  animeId: Anime['id'];
  variables: AnimeQueryVariables;
}

export function useAnimeData<T>({
  name,
  animeId,
  variables
}: UseAnimeDataProps) {
  const { 
    data, 
    isLoading, 
    error,
    refetch
  }: UseQueryResult<AnilistResponse<"Media", T>, Error> = useQuery({
    ...animeQueries.data({ animeId, name, variables }),
  })

  return {
    data: data?.Media,
    isLoading,
    error,
    refetch
  };
}