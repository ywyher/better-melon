import { Static, t } from "elysia";
import { date } from ".";
import { anilistCoverImage, anilistFormat, anilistStatus, anilistTitle, anilistNextAiringEpisode } from "@better-melon/shared/types"

export const anilistAnime = t.Object({
  id: t.Number(),
  bannerImage: t.Nullable(t.String()),
  coverImage: anilistCoverImage,
  title: anilistTitle,
  format: anilistFormat,
  status: anilistStatus,
  startDate: date,
  endDate: date,
  episodes: t.Number(),
  nextAiringEpisode: t.Nullable(anilistNextAiringEpisode),
})

export type AnilistAnime = Static<typeof anilistAnime>