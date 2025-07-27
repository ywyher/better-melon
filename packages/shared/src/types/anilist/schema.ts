import { Type as t } from "@sinclair/typebox";

export const anilistGenre = t.Union([
  t.Literal("Action"),
  t.Literal("Adventure"),
  t.Literal("Comedy"),
  t.Literal("Drama"),
  t.Literal("Ecchi"),
  t.Literal("Fantasy"),
  t.Literal("Hentai"),
  t.Literal("Horror"),
  t.Literal("Mahou Shoujo"),
  t.Literal("Mecha"),
  t.Literal("Music"),
  t.Literal("Mystery"),
  t.Literal("Psychological"),
  t.Literal("Romance"),
  t.Literal("Sci-Fi"),
  t.Literal("Slice of Life"),
  t.Literal("Sports"),
  t.Literal("Supernatural"),
  t.Literal("Thriller")
])

export const anilistStatus = t.Union([
  t.Literal("CANCELLED"),
  t.Literal("FINISHED"),
  t.Literal("HIATUS"),
  t.Literal("NOT_YET_RELEASED"),
  t.Literal("RELEASING")
])

export const anilistSeason = t.Union([
  t.Literal("SPRING"),
  t.Literal("FALL"),
  t.Literal("SUMMER"),
  t.Literal("WINTER")
])

export const anilistFormat = t.Union([
  t.Literal("TV"),
  t.Literal("TV_SHORT"),
  t.Literal("MOVIE"),
  t.Literal("SPECIAL"),
  t.Literal("OVA"),
  t.Literal("ONA"),
  t.Literal("MUSIC") 
])

export const anilistSource = t.Union([
  t.Literal("ORIGINAL"),
  t.Literal("MANGA"),
  t.Literal("LIGHT_NOVEL"),
  t.Literal("VISUAL_NOVEL"),
  t.Literal("VIDEO_GAME"),
  t.Literal("NOVEL"),
  t.Literal("DOUJINSHI"),
  t.Literal("ANIME"),
  t.Literal("WEB_NOVEL"),
  t.Literal("LIVE_ACTION"),
  t.Literal("GAME"),
  t.Literal("COMIC"),
  t.Literal("MULTIMEDIA_PROJECT"),
  t.Literal("PICTURE_BOOK"),
  t.Literal("OTHER")
])

export const anilistSort = t.Union([
  t.Literal("ID"),
  t.Literal("ID_DESC"),
  t.Literal("TITLE_ROMAJI"),
  t.Literal("TITLE_ROMAJI_DESC"),
  t.Literal("TITLE_ENGLISH"),
  t.Literal("TITLE_ENGLISH_DESC"),
  t.Literal("TITLE_NATIVE"),
  t.Literal("TITLE_NATIVE_DESC"),
  t.Literal("TYPE"),
  t.Literal("TYPE_DESC"),
  t.Literal("FORMAT"),
  t.Literal("FORMAT_DESC"),
  t.Literal("START_DATE"),
  t.Literal("START_DATE_DESC"),
  t.Literal("END_DATE"),
  t.Literal("END_DATE_DESC"),
  t.Literal("SCORE"),
  t.Literal("SCORE_DESC"),
  t.Literal("POPULARITY"),
  t.Literal("POPULARITY_DESC"),
  t.Literal("TRENDING"),
  t.Literal("TRENDING_DESC"),
  t.Literal("EPISODES"),
  t.Literal("EPISODES_DESC"),
  t.Literal("DURATION"),
  t.Literal("DURATION_DESC"),
  t.Literal("STATUS"),
  t.Literal("STATUS_DESC"),
  t.Literal("CHAPTERS"),
  t.Literal("CHAPTERS_DESC"),
  t.Literal("VOLUMES"),
  t.Literal("VOLUMES_DESC"),
  t.Literal("UPDATED_AT"),
  t.Literal("UPDATED_AT_DESC"),
  t.Literal("SEARCH_MATCH"),
  t.Literal("FAVOURITES"),
  t.Literal("FAVOURITES_DESC")	
])

export const anilistTitle = t.Object({
  english: t.String(),
  romaji: t.Optional(t.String()),
  native: t.Optional(t.String()),
})

export const anilistNextAiringEpisode = t.Object({
  episode: t.Number(),
  airingAt: t.Number(),
  timeUntilAiring: t.Number()
})

export const anilistCoverImage = t.Object({
  medium: t.String(),
  large: t.String(),
  extraLarge: t.String()
})