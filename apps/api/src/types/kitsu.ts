import { t } from "elysia";
import { datePattern } from ".";
import { kitsuEpisode, kitsuTitles } from "@better-melon/shared/types"

export const kitsuDimensions = t.Object({
  width: t.Number(),
  height: t.Number()
})

export const kitsuStatus = t.UnionEnum([
  "current",
  "finished",
  "tba",
  "unreleased",
  "upcoming"
])

export const anilistToKitsu = t.Object({
  q: t.String(),
  success: t.Boolean(),
  status: kitsuStatus,
  startDate: t.String({ pattern: datePattern }),
  endDate: t.Nullable(t.String({ pattern: datePattern })),
})

export const kitsuPoster = t.Object({
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
    tiny: kitsuDimensions,
    small: kitsuDimensions,
    medium: kitsuDimensions,
    large: kitsuDimensions,
    original: kitsuDimensions,
  })
})

export const kitsuCover = t.Object({
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
    tiny: kitsuDimensions,
    medium: kitsuDimensions,
    large: kitsuDimensions,
    original: kitsuDimensions,
  })
})

export const kitsuAttributes = t.Object({
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
  status: kitsuStatus,
  posterImage: kitsuPoster,
  coverImage: kitsuCover,
  episodeCount: t.Number(),
  episodeLength: t.Number(),
  youtubeVideoId: t.String(),
  showType: t.String(),
  nsfw: t.Boolean(),
  createdAt: t.String(),
  updatedAt: t.String(),
})

export const kitsuAnime = t.Object({
  id: t.String(),
  type: t.Literal("anime"),
  links: t.Object({
    self: t.String()
  }),
  attributes: kitsuAttributes,
  relationships: t.Any()
})

export const kitsuResponse = t.Object({
  anime: kitsuAnime,
  episode: kitsuEpisode
})

export type KitsuResponse = typeof kitsuResponse.static
export type KitsuAttributes = typeof kitsuAttributes.static
export type KitsuAnime = typeof kitsuAnime.static
export type KitsuStatus = typeof kitsuStatus.static
export type KitsuDimensions = typeof kitsuDimensions.static
export type KitsuPoster = typeof kitsuPoster.static
export type KitsuCover = typeof kitsuCover.static
export type AnilistToKitsu = typeof anilistToKitsu.static

export type KitsuApiResponse<T> = {
  data: T
  meta: {
    count: number;
  }
}