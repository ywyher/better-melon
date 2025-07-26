import { t } from "elysia";
import { anilistAnimeData } from "./anilist";
import { datePattern } from ".";

export const hianimeAnimeStatus = t.UnionEnum(["finished-airing", "currently-airing", "not-yet-aired"])
export const hianimeAnimeSeasons = t.UnionEnum(["spring", "fall", "summer", "winter"])
export const hianimeAnimeType = t.UnionEnum(['movie', 'tv', 'ova', 'ona', 'special', 'music'])

const commaSeparatedPattern = '^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$';

export const anilistToHiAnime = t.Object({
  q: t.String(),
  success: t.Boolean(),
  type: hianimeAnimeType,
  status: hianimeAnimeStatus,
  startDate: t.String({ pattern: datePattern }),
  endDate: t.Nullable(t.String({ pattern: datePattern })),
})

export const hianimeAnimeEpisode = t.Object({
  number: t.Number(),
  title: t.String(),
  episodeId: t.String(),
  isFiller: t.Boolean(),
})

export const hianimeAnimeEpiosdeSourcesHeader = t.Object({
  Referer: t.String()
})

export const hianimeAnimeEpisodeTimeSegment = t.Object({
  intro: t.Number(),
  outro: t.Number()
})

export const hianimeAnimeEpisodeTrack = t.Object({
  url: t.String(),
  label: t.Optional(t.String()),
  kind: t.Optional(t.String()),
})

export const hianimeAnimeEpisodeSource = t.Object({
  file: t.String(),
  type: t.String()
})

export const hianimeAnimeEpisodeSources = t.Object({
  headers: t.Optional(hianimeAnimeEpiosdeSourcesHeader),
  tracks: t.Array(hianimeAnimeEpisodeTrack),
  intro: hianimeAnimeEpisodeTimeSegment,
  outro: hianimeAnimeEpisodeTimeSegment,
  sources: t.Array(hianimeAnimeEpisodeSource),
  iframe: t.String(),
  serverId: t.String(),
})

export const hianimeAnimeData = t.Object({
  id: t.String(),
  name: t.String(),
  jname: t.String(),
  poster: t.String(),
  duration: t.String(),
  type: hianimeAnimeType,
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
    type: hianimeAnimeType,
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

export const hianimeEpisodesResponse = t.Object({
  totalEpisodes: t.Number(),
  episodes: t.Array(hianimeAnimeEpisode)
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
export type HianimeAnimeType = typeof hianimeAnimeType.static
export type HianimeAnimeEpisodesResponse = typeof hianimeEpisodesResponse.static
export type AnilistToHiAnime = typeof anilistToHiAnime.static

export type HianimeApiResponse<T> = {
  success: boolean,
  data: T
}