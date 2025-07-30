import type { Static } from "@sinclair/typebox";
import type { anilistCoverImage, anilistFormat, anilistGenre, anilistSeason, anilistSort, anilistSource, anilistStatus, anilistTitle, anilistNextAiringEpisode, anilistTag } from "./schema"

export type AnilistStatus = Static<typeof anilistStatus>
export type AnilistTag = Static<typeof anilistTag>
export type AnilistGenre = Static<typeof anilistGenre>
export type AnilistSeason = Static<typeof anilistSeason>
export type AnilistFormat = Static<typeof anilistFormat>
export type AnilistSource = Static<typeof anilistSource>
export type AnilistSort = Static<typeof anilistSort>
export type AnilistTitle = Static<typeof anilistTitle>
export type AnilistNextAiringEpisode = Static<typeof anilistNextAiringEpisode>
export type AnilistCoverImage = Static<typeof anilistCoverImage>

// AnilistResponse<'Page', { media: [] }>
export type AnilistResponse<Key extends string, T> = {
  [K in Key]: T
}

export type AnilistDyanmicData<T extends {
  nextAiringEpisode?: any;
  status?: any;
  episodes?: any;
}> = Pick<T, "nextAiringEpisode" | "status" | "episodes">
export type AnilistStaticData<T> = Omit<T, 'nextAiringEpisode' | 'status' | 'episodes'>