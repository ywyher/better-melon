import { animeQueries } from "@/lib/queries/anime"
import { Anime } from "@/types/anime"
import { ApiResponse } from "@/types/api"
import { KitsuEpisodesReponse } from "@better-melon/shared/types"
import { useQuery, UseQueryResult } from "@tanstack/react-query"

type UseEpisodesMetadataProps = {
  animeId: Anime['id']
  limit?: number
  offset?: number
}

export default function useEpisodesMetadata({ animeId, limit, offset }: UseEpisodesMetadataProps) {
  const {
    data,
    isLoading,
    error
  }: UseQueryResult<ApiResponse<KitsuEpisodesReponse>, Error> = useQuery({
    ...animeQueries.episodesMetadata({ animeId, limit, offset })
  })

  return {
    data: {
      episodes: data?.data?.episodes,
      count: data?.data?.count,
    },
    isLoading,
    error
  }
}