import { t } from "elysia";
import { anilistAnimeData } from "./anilist";
import { date } from ".";

export const hianimeAnimeStatus = t.UnionEnum([
  "FINISHED",
  "NOT_YET_RELEASED",
  "RELEASING"
])
export const hianimeAnimeSeasons = t.UnionEnum(["spring", "fall", "summer", "winter"])
export const hianimeAnimeFormat = t.UnionEnum([
  "TV"
, "MOVIE" 
, "SPECIAL" 
, "OVA" 
, "ONA" 
, "MUSIC" 
])

export const anilistToHiAnime = t.Object({
  q: t.String(),
  success: t.Boolean(),
  format: hianimeAnimeFormat,
  status: hianimeAnimeStatus,
  startDate: date,
  endDate: t.Nullable(date),
})

export const hianimeAnimeTitle = t.Object({
  english: t.String(),
  native: t.Optional(t.String())
})

export const hianimeAnimeEpisode = t.Object({
  id: t.Number(),
  number: t.Number(),
  title: t.Partial(hianimeAnimeTitle),
  isFiller: t.Boolean(),
})

export const hianimeAnimeEpiosdeSourcesHeader = t.Object({
  Referer: t.String()
})

export const hianimeAnimeEpisodeTimeSegment = t.Object({
  start: t.Number(),
  end: t.Number()
})

export const hianimeAnimeEpisodeTrack = t.Object({
  file: t.String(),
  label: t.Optional(t.String()),
  kind: t.Optional(t.String()),
  default: t.Optional(t.Boolean())
})

export const hianimeAnimeEpisodeSource = t.Object({
  file: t.String(),
  type: t.String()
})

export const hianimeAnimeEpisodeSources = t.Object({
  sources: hianimeAnimeEpisodeSource,
  headers: t.Optional(hianimeAnimeEpiosdeSourcesHeader),
  tracks: t.Array(hianimeAnimeEpisodeTrack),
  intro: hianimeAnimeEpisodeTimeSegment,
  outro: hianimeAnimeEpisodeTimeSegment,
  iframe: t.String(),
  serverId: t.Number(),
})

export const hianimeAnimeData = t.Object({
  id: t.String(),
  name: t.String(),
  jname: t.String(),
  poster: t.String(),
  duration: t.String(),
  format: hianimeAnimeFormat,
  rating: t.Nullable(t.Number()),
  episodes: t.Object({
    sub: t.Number(),
    dub: t.Number(),
  })
})

export const hianimeSearchResponse = t.Object({
  animes: t.Array(hianimeAnimeData),
  mostPopularAnimes: t.Array(hianimeAnimeData),
  searchFilters: t.Object({
    genres: t.String(),
    format: hianimeAnimeFormat,
    status: hianimeAnimeStatus,
    season: hianimeAnimeSeasons,
    sort: t.String(),
    language: t.UnionEnum(['sub', 'dub']),
    score: t.String(),
  }),
  totalPages: t.Number(),
  hasNextPage: t.Boolean(),
  currentPage: t.Number()
})

export const hianimeAnimeResponse = t.Object({
  details: anilistAnimeData,
  sources: hianimeAnimeEpisodeSources
})

export type HianimeAnimeResponse = typeof hianimeAnimeResponse.static
export type HianimeAnimeEpisodeSources = typeof hianimeAnimeEpisodeSources.static
export type HianimeAnimeData = typeof hianimeAnimeData.static
export type HianimeAnimeEpisode = typeof hianimeAnimeEpisode.static
export type HianimeSearchResponse = typeof hianimeSearchResponse.static
export type HianimeAnimeStatus = typeof hianimeAnimeStatus.static
export type HianimeAnimeSeason = typeof hianimeAnimeSeasons.static
export type HianimeAnimeFormat = typeof hianimeAnimeFormat.static
export type AnilistToHiAnime = typeof anilistToHiAnime.static

export type HianimeApiResponse<T> = {
  success: boolean,
  data: T
}