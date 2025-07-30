import { t } from "elysia";
import { datePattern } from ".";
import { kitsuTitles } from "@better-melon/shared/types"

export const kitsuAnimeDimensions = t.Object({
  width: t.Number(),
  height: t.Number()
})

export const kitsuAnimeStatus = t.UnionEnum([
  "current",
  "finished",
  "tba",
  "unreleased",
  "upcoming"
])

export const anilistToKitsu = t.Object({
  q: t.String(),
  success: t.Boolean(),
  status: kitsuAnimeStatus,
  startDate: t.String({ pattern: datePattern }),
  endDate: t.Nullable(t.String({ pattern: datePattern })),
})

export const kitsuAnimePoster = t.Object({
  tiny: t.String({
    format: 'uri'
  }),
  small: t.String({
    format: 'uri'
  }),
  medium: t.String({
    format: 'uri'
  }),
  large: t.String({
    format: 'uri'
  }),
  original: t.String({
    format: 'uri'
  }),
  meta: t.Object({
    tiny: kitsuAnimeDimensions,
    small: kitsuAnimeDimensions,
    medium: kitsuAnimeDimensions,
    large: kitsuAnimeDimensions,
    original: kitsuAnimeDimensions,
  })
})

export const kitsuAnimeCover = t.Object({
  tiny: t.String({
    format: 'uri'
  }),
  medium: t.String({
    format: 'uri'
  }),
  large: t.String({
    format: 'uri'
  }),
  original: t.String({
    format: 'uri'
  }),
  meta: t.Object({
    tiny: kitsuAnimeDimensions,
    medium: kitsuAnimeDimensions,
    large: kitsuAnimeDimensions,
    original: kitsuAnimeDimensions,
  })
})

export const kitsuAnimeAttributes = t.Object({
  slug: t.String(),
  synopsis: t.Nullable(t.String()),
  description: t.Nullable(t.String()),
  coverImageTopOffset: t.Number(),
  titles: t.Partial(kitsuTitles),
  canonicalTitle: t.Nullable(t.String()),
  abbreviatedTitles: t.Array(t.String()),
  ratingFrequencies: t.Any(),
  averageRating: t.String(),
  userCount: t.Number(),
  favoritesCount: t.Number(),
  startDate: t.String(),
  endDate: t.String(),
  popularityRank: t.Number(),
  ratingRank: t.Number(),
  ageRating: t.String(),
  ageRatingGuide: t.String(),
  subtype: t.String(),
  status: kitsuAnimeStatus,
  posterImage: kitsuAnimePoster,
  coverImage: kitsuAnimeCover,
  episodeCount: t.Number(),
  episodeLength: t.Number(),
  youtubeVideoId: t.String(),
  showType: t.String(),
  nsfw: t.Boolean(),
  createdAt: t.String(),
  updatedAt: t.String(),
})

export const kitsuAnimeInfo = t.Object({
  id: t.String(),
  type: t.Literal("anime"),
  links: t.Object({
    self: t.String()
  }),
  attributes: kitsuAnimeAttributes,
  relationships: t.Any()
})

export type KitsuAnimeAttributes = typeof kitsuAnimeAttributes.static
export type KitsuAnimeInfo = typeof kitsuAnimeInfo.static
export type KitsuAnimeStatus = typeof kitsuAnimeStatus.static
export type KitsuAnimeDimensions = typeof kitsuAnimeDimensions.static
export type KitsuAnimePoster = typeof kitsuAnimePoster.static
export type KitsuAnimeCover = typeof kitsuAnimeCover.static
export type AnilistToKitsu = typeof anilistToKitsu.static

export type KitsuApiResponse<T> = {
  data: T
  meta: {
    count: number;
  }
}