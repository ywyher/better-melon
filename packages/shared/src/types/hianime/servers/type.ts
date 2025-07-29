import type { Static } from "@sinclair/typebox"
import type { hianimeEpisodeServer, hianimeEpisodeServers, hianimeServerName } from "./schema"

export type HianimeEpisodeServer = Static<typeof hianimeEpisodeServer>
export type HianimeEpisodeServers = Static<typeof hianimeEpisodeServers>
export type HianimeServerName = Static<typeof hianimeServerName>