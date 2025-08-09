import { Type as t } from '@sinclair/typebox'
import { kitsuTitles } from '../anime/schema'

export const kitsuEpisodeThumbnail = t.Object({
  original: t.String(),
})

export const kitsuEpisodeAttributes = t.Object({
  synopsis: t.Optional(t.Union([
    t.String(),
    t.Null()
  ])),
  description: t.Optional(t.Union([
    t.String(),
    t.Null()
  ])),
  titles: t.Partial(kitsuTitles),
  canonicalTitle: t.Optional(t.String()),
  seasonNumber: t.Optional(t.Union([
    t.Number(),
    t.Null()
  ])),
  number: t.Number(),
  relativeNumber: t.Optional(t.Union([t.Number(), t.Null()])),
  airdate: t.Optional(t.Union([
    t.String(),
    t.Null()
  ])),
  length: t.Union([
    t.Number(),
    t.Null()
  ]), // duration
  thumbnail: t.Optional(kitsuEpisodeThumbnail),
  createdAt: t.String(),
  updatedAt: t.String(),
})

export const kitsuEpisode = t.Object({
  id: t.String(),
  type: t.Literal("episodes"),
  links: t.Object({
    self: t.String()
  }),
  attributes: kitsuEpisodeAttributes,
  relationships: t.Any()
})

export const kitsuEpisodesReponse = t.Object({
  episodes: t.Array(kitsuEpisode),
  count: t.Number()
})