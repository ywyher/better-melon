import { Type as t } from "@sinclair/typebox" 
import { hianimeLanguage } from "../anime/schema"

export const hianimeEpisodeSourcesHeader = t.Object({
  Referer: t.String()
})

export const hianimeEpisodeSourcesTimeSegment = t.Object({
  start: t.Number(),
  end: t.Number()
})

export const hianimeEpisodeSourcesTrack = t.Object({
  file: t.String(),
  label: t.Optional(t.String()),
  kind: t.Optional(t.String()),
  default: t.Optional(t.Boolean())
})

export const hianimeEpisodeSource = t.Object({
  file: t.String(),
  type: t.String()
})

export const hianimeEpisodeSources = t.Object({
  type: hianimeLanguage,
  sources: hianimeEpisodeSource,
  tracks: t.Array(hianimeEpisodeSourcesTrack),
  intro: hianimeEpisodeSourcesTimeSegment,
  outro: hianimeEpisodeSourcesTimeSegment,
  iframe: t.String(),
  serverId: t.Number()
})