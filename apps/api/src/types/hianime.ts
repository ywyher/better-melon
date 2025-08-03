import { t } from "elysia";
import { hianimeFormat, hianimeEpisodeSources, hianimeStatus, hianimeAnime, hianimeEpisode, hianimeEpisodeServers, animeDate } from "@better-melon/shared/types";

export const anilistToHiAnime = t.Object({
  q: t.String(),
  success: t.Boolean(),
  format: hianimeFormat,
  status: hianimeStatus,
  startDate: animeDate,
  endDate: t.Nullable(animeDate),
})

export const hianimeResponse = t.Object({
  anime: hianimeAnime,
  episodes: t.Array(hianimeEpisode),
  servers: hianimeEpisodeServers,
  sources: hianimeEpisodeSources
})

export type HianimeResponse = typeof hianimeResponse.static
export type AnilistToHiAnime = typeof anilistToHiAnime.static

export type HianimeApiResponse<T> = {
  success: boolean,
  data: T
}