import { t } from "elysia";
import { datePattern } from ".";

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

export const kitsuAnimeTitles = t.Object({
  en: t.String(),
  en_jp: t.String(),
  en_us: t.String(),
  ja_jp: t.String(),
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
  titles: t.Partial(kitsuAnimeTitles),
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

export const kitsuAnimeEpisodeThumbnail = t.Object({
  original: t.String(),
})

export const kitsuAnimeEpisodeAttributes = t.Object({
  synopsis: t.Nullable(t.String()),
  description: t.Nullable(t.String()),
  titles: t.Partial(kitsuAnimeTitles),
  canonicalTitle: t.Nullable(t.String()),
  seasonNumber: t.Nullable(t.Number()),
  number: t.Number(),
  relativeNumber: t.Nullable(t.Number()),
  airdate: t.Nullable(t.String()),
  length: t.Number(), // duration
  thumbnail: t.Nullable(kitsuAnimeEpisodeThumbnail),
  createdAt: t.String(),
  updatedAt: t.String(),
})

export const kitsuAnimeEpisode = t.Object({
  id: t.String(),
  type: t.Literal("episodes"),
  links: t.Object({
    self: t.String()
  }),
  attributes: kitsuAnimeEpisodeAttributes,
  relationships: t.Any()
})

export const kitsuAnimeEpisodesReponse = t.Object({
  episodes: t.Array(kitsuAnimeEpisode),
  count: t.Number()
})

export type KitsuAnimeEpisodesReponse = typeof kitsuAnimeEpisodesReponse.static
export type KitsuAnimeAttributes = typeof kitsuAnimeAttributes.static
export type KitsuAnimeInfo = typeof kitsuAnimeInfo.static
export type KitsuAnimeStatus = typeof kitsuAnimeStatus.static
export type KitsuAnimeDimensions = typeof kitsuAnimeDimensions.static
export type KitsuAnimeTitles = typeof kitsuAnimeTitles.static
export type KitsuAnimePoster = typeof kitsuAnimePoster.static
export type KitsuAnimeCover = typeof kitsuAnimeCover.static
export type AnilistToKitsu = typeof anilistToKitsu.static

export type KitsuAnimeEpisodeThumbnail = typeof kitsuAnimeEpisodeThumbnail.static
export type KitsuAnimeEpisodeAttributes = typeof kitsuAnimeEpisodeAttributes.static
export type KitsuAnimeEpisode = typeof kitsuAnimeEpisode.static

export type KitsuApiResponse<T> = {
  data: T
  meta: {
    count: number;
  }
}