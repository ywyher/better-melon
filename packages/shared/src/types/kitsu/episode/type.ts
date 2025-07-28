import type { Static } from "@sinclair/typebox"
import type { kitsuEpisode, kitsuEpisodeAttributes, kitsuEpisodesReponse, kitsuEpisodeThumbnail } from "./schema"

export type KitsuEpisodeAttributes = Static<typeof kitsuEpisodeAttributes>
export type KitsuEpisodeThumbnail = Static<typeof kitsuEpisodeThumbnail>
export type KitsuEpisode = Static<typeof kitsuEpisode>
export type KitsuEpisodesReponse = Static<typeof kitsuEpisodesReponse>