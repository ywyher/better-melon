import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { animeQueries } from "@/lib/queries/anime";
import { AnilistResponse } from "@better-melon/shared/types";
import { AnimeListQueryVariableKeys, AnimeListQueryVariables } from "@/types/anime";
import { AnilistPageInfo } from "@/types/anilist";

type UseAnimeListProps = {
  name: AnimeListQueryVariableKeys;
  variables: AnimeListQueryVariables;
}

export function useAnimeList<T>({
  name,
  variables
}: UseAnimeListProps) {
  const { 
    data, 
    isLoading, 
    error,
    refetch
  }: UseQueryResult<AnilistResponse<"Page", { pageInfo: AnilistPageInfo, media: T }>, Error> = useQuery({
    ...animeQueries.list({ name, variables }),
  })

  return {
    data,
    isLoading,
    error,
    refetch
  };
}