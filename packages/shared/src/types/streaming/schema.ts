import { Type as t } from "@sinclair/typebox" 

import { anilistAnime } from "../anilist/schema";
import { animeProvider } from "../anime/schema";
import { hianimeEpisodeSources } from "../hianime/sources/schema";
import { kitsuEpisode } from "../kitsu/episode/schema";
import { subtitleFile } from "../subtitle/schema";

export const streamingData = t.Object({
  provider: animeProvider,
  anime: anilistAnime,
  episode: t.Object({
    details: kitsuEpisode,
    sources: hianimeEpisodeSources,
    subtitles: t.Array(subtitleFile),
  }),
})