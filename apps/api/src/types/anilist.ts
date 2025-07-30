import { Static, t } from "elysia";
import { anilistCoverImage, anilistFormat, anilistStatus, anilistTitle, anilistNextAiringEpisode, animeDate } from "@better-melon/shared/types"

export const anilistAnime = t.Object({
  id: t.Number(),
  title: anilistTitle,
  format: anilistFormat,
  status: anilistStatus,
  bannerImage: t.Nullable(t.String()),
  coverImage: anilistCoverImage,
  episodes: t.Number(),
  nextAiringEpisode: t.Nullable(anilistNextAiringEpisode),
  startDate: animeDate,
  endDate: animeDate,
})

export type AnilistAnime = Static<typeof anilistAnime>