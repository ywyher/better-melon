import { GET_ANIME_DYNAMIC_DATA } from "@/lib/graphql/queries";
import { Anime } from "@/types/anime";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { QueryResult, useQuery as useApolloQuery } from "@apollo/client";
import { animeQueries } from "@/lib/queries/anime";
import { AnilistResponse } from "@/types/anilist";
import { useMemo } from "react";

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

  const formattedDynamicData = useMemo(() => {
    return {
      status: dynamicData?.Media.status,
      episodes: dynamicData?.Media.episodes,
      streamingEpisodes: dynamicData?.Media.streamingEpisodes
        .filter((episode) => {
          if (episode.title === "PV" || episode.title.includes("PV")) {
            return false;
          }
          
          // Filter out episodes with decimal numbers (like 12.5, 22.5)
          const hasDecimalNumber = /\d+\.\d+/.test(episode.title);
          return !hasDecimalNumber;
        })
        .map((episode) => {
          // Extract episode number from title
          const episodeNumberMatch = episode.title.match(/Episode (\d+)/i);
          const episodeNumber = episodeNumberMatch ? parseInt(episodeNumberMatch[1]) : null;
          
          // Clean title by removing "Episode X - " pattern
          const cleanTitle = episode.title.replace(/^Episode \d+\s*-\s*/, '');
          
          return {
            number: episodeNumber,
            title: cleanTitle,
            thumbnail: episode.thumbnail,
          };
        })
    };
  }, [dynamicData]);

  return {
    data: {
      ...staticData?.Media,
      ...formattedDynamicData,
    } as Anime,
    isLoading: isStaticLoading || isDynamicLoading,
    error: staticError || dynamicError,
    refetch: () => {
      refetchDynamic()
      refetchStatic()
    },
  };
}