import type { Static } from "@sinclair/typebox"
import type { hianimeEpisodeSource, hianimeEpisodeSources, hianimeEpisodeSourcesHeader, hianimeEpisodeSourcesTimeSegment, hianimeEpisodeSourcesTrack } from "./schema"

export type HianimeEpisodeSourcesHeader = Static<typeof hianimeEpisodeSourcesHeader>
export type HianimeEpisodeSourcesTimeSegment = Static<typeof hianimeEpisodeSourcesTimeSegment>
export type HianimeEpisodeSourcesTrack = Static<typeof hianimeEpisodeSourcesTrack>
export type HianimeEpisodeSource = Static<typeof hianimeEpisodeSource>
export type HianimeEpisodeSources = Static<typeof hianimeEpisodeSources>