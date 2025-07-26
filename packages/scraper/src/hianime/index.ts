import { getHianimeEpisodes } from "./scrapers/episodes.scraper";
import { hianimeSearch } from "./scrapers/search.scraper";
import { getHianimeEpisodeServers } from "./scrapers/servers.scraper";
import { getHianimeEpisodeSources } from "./scrapers/sources.scraper";
import type { HianimeSearchResponse } from "./types";
import type { GetHianimeEpisodesProps, HianimeAnimeEpisode } from "./types/episodes";
import type { HianimeSearchProps } from "./types/search";
import type { GetEpisodeServersProps } from "./types/servers";
import type { GetHianimeEpisodeSourcesProps, HianimeEpisodeSources } from "./types/sources";

export default class Hianime {
  async search({ q, page = 1, filters = {} }: HianimeSearchProps): Promise<HianimeSearchResponse> {
    const results = await hianimeSearch({
      q,
      page,
      filters
    })

    return results
  }

  async getEpisodeServers({ episodeId }: GetEpisodeServersProps) {
    return getHianimeEpisodeServers({ episodeId });
  }

  async getEpisodes({ animeId }: GetHianimeEpisodesProps): Promise<HianimeAnimeEpisode[]> {
    return getHianimeEpisodes({ animeId });
  }

  async getEpisodeSources({
    episodeId,
    server, // optional
    fallback = false,
  }: GetHianimeEpisodeSourcesProps): Promise<HianimeEpisodeSources> {
    return getHianimeEpisodeSources({
      episodeId,
      server,
      fallback
    });
  }
}