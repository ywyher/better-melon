import { t } from "elysia";

export const anilistAnimeStatus = t.UnionEnum([
  "CANCELLED",
  "FINISHED",
  "HIATUS",
  "NOT_YET_RELEASED",
  "RELEASING"
])
export const anilistAnimeSeason = t.UnionEnum(["SPRING" , "FALL" , "SUMMER" , "WINTER"])
export const anilistAnimeFormat = t.UnionEnum([
  "TV" 
, "TV_SHORT" 
, "MOVIE" 
, "SPECIAL" 
, "OVA" 
, "ONA" 
, "MUSIC" 
])
export const anilistAnimeSource = t.UnionEnum([
  "ORIGINAL"
, "MANGA"
, "LIGHT_NOVEL"
, "VISUAL_NOVEL"
, "VIDEO_GAME"
, "NOVEL"
, "DOUJINSHI"
, "ANIME"
, "WEB_NOVEL"
, "LIVE_ACTION"
, "GAME"
, "COMIC"
, "MULTIMEDIA_PROJECT"
, "PICTURE_BOOK"
, "OTHER"
])

export const anilistAnimeSort = t.UnionEnum([
  "ID"	
, "ID_DESC"	
, "TITLE_ROMAJI"	
, "TITLE_ROMAJI_DESC"	
, "TITLE_ENGLISH"	
, "TITLE_ENGLISH_DESC"	
, "TITLE_NATIVE"	
, "TITLE_NATIVE_DESC"	
, "TYPE"	
, "TYPE_DESC"	
, "FORMAT"	
, "FORMAT_DESC"	
, "START_DATE"	
, "START_DATE_DESC"	
, "END_DATE"	
, "END_DATE_DESC"	
, "SCORE"	
, "SCORE_DESC"	
, "POPULARITY"	
, "POPULARITY_DESC"	
, "TRENDING"	
, "TRENDING_DESC"	
, "EPISODES"	
, "EPISODES_DESC"	
, "DURATION"	
, "DURATION_DESC"	
, "STATUS"	
, "STATUS_DESC"	
, "CHAPTERS"	
, "CHAPTERS_DESC"	
, "VOLUMES"	
, "VOLUMES_DESC"	
, "UPDATED_AT"	
, "UPDATED_AT_DESC"	
, "SEARCH_MATCH"	
, "FAVOURITES"	
, "FAVOURITES_DESC"	
])

export const anilistAnimeTitle = t.Object({
  english: t.String(),
  romaji: t.Optional(t.String()),
  native: t.Optional(t.String()),
})

export const anilistAnimeDate = t.Object({
  day: t.Number(),
  month: t.Number(),
  year: t.Number(),
})

export const anilistNextAiringEpisode = t.Object({
  episode: t.Number(),
  timeUntilAiring: t.Number()
})

export const anilistAnimeData = t.Object({
  id: t.Union([
    t.String(),
    t.Number()
  ]),
  idMal: t.Union([
    t.String(),
    t.Number()
  ]),
  bannerImage: t.Nullable(t.String()),
  coverImage: t.Object({
    large: t.String(),
    medium: t.String(),
  }),
  title: anilistAnimeTitle,
  status: anilistAnimeStatus,
  startDate: anilistAnimeDate,
  endDate: anilistAnimeDate,
  description: t.String(),
  episodes: t.Number(),
  nextAiringEpisode: t.Nullable(anilistNextAiringEpisode),
  season: anilistAnimeSeason,
  seasonYear: t.Number(),
  format: anilistAnimeFormat,
  genres: t.Array(t.String()),
  averageScore: t.Number(),
  isAdult: t.Boolean()
})

export type AnilistAnimeData = typeof anilistAnimeData.static
export type AnilistAnimeDyanmicData = Pick<typeof anilistAnimeData.static, "nextAiringEpisode" | 'status' | 'episodes'>
export type AnilistAnimeStaticData = Omit<typeof anilistAnimeData.static, 'nextAiringEpisode' | 'status' | 'episodes'>
export type AnilistAnimeStatus = typeof anilistAnimeStatus.static
export type AnilistAnimeSeason = typeof anilistAnimeSeason.static
export type AnilistAnimeFormat = typeof anilistAnimeFormat.static
export type AnilistAnimeSource = typeof anilistAnimeSource.static
export type AnilistAnimeSort = typeof anilistAnimeSort.static
export type AnilistAnimeTitle = typeof anilistAnimeTitle.static
export type AnilistAnimeDate = typeof anilistAnimeDate.static
export type AnilistNextAiringEpisode = typeof anilistNextAiringEpisode.static

export type AnilistAnimeResponse<T> = {
  data: {
    Media: T
  }  
}