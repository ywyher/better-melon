import { t } from "elysia";
import { anilistAnime } from "./anilist";
import { date } from ".";
import { hianimeFormat, hianimeEpisodeSources, hianimeStatus } from "@better-melon/shared/types";

export const anilistToHiAnime = t.Object({
  q: t.String(),
  success: t.Boolean(),
  format: hianimeFormat,
  status: hianimeStatus,
  startDate: date,
  endDate: t.Nullable(date),
})

export const hianimeResponse = t.Object({
  details: anilistAnime,
  sources: hianimeEpisodeSources
})

export type HianimeResponse = typeof hianimeResponse.static
export type AnilistToHiAnime = typeof anilistToHiAnime.static

export type HianimeApiResponse<T> = {
  success: boolean,
  data: T
}