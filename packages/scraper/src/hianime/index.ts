import { getHianimeEpisodes } from "./scrapers/episodes.scraper";
import { hianimeSearch } from "./scrapers/search.scraper";
import { getHianimeEpisodeServers } from "./scrapers/servers.scraper";
import { getHianimeEpisodeSources } from "./scrapers/sources.scraper";
import type { HianimeEpisode, HianimeSearchResponse, HianimeEpisodeSources } from "@better-melon/shared/types";
import type { GetHianimeEpisodesProps } from "./types/episode";
import type { HianimeSearchProps } from "./types/search";
import type { GetEpisodeServersProps } from "./types/server";
import type { GetHianimeEpisodeSourcesProps } from "./types/source";

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

  async getEpisodes({ animeId }: GetHianimeEpisodesProps): Promise<HianimeEpisode[]> {
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