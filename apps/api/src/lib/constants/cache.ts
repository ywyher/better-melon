import { AnilistAnime, HianimeAnime, HianimeEpisode } from "@better-melon/shared/types";
import { KitsuAnime } from "../../types/kitsu";

export const cacheKeys = {
  anilist: {
    static: (anilistId: AnilistAnime['id']) => `anilist:static:${anilistId}`,
    dynamic: (anilistId: AnilistAnime['id']) => `anilist:dynamic:${anilistId}`
  },
  hianime: {
    info: (animeId: AnilistAnime['id']) => `hianime:info:${animeId}`,
    episodes: (animeId: HianimeAnime['id']) => `hianime:episodes:${animeId}`,
    servers: (episodeId: HianimeEpisode['id']) => `hianime:servers:${episodeId}`,
    sources: (episodeId: HianimeEpisode['id']) => `hianime:sources:${episodeId}`
  },
  subtitle: {
    entries: (animeId: AnilistAnime['id']) => `subtitle:entries:${animeId}`,
    files: (entryId: number, episodeNumber: number) => `subtitle:files:${entryId}:${episodeNumber}`
  },
  kitsu: {
    info: (animeId: KitsuAnime['id']) => `kitsu:info:${animeId}`,
    episode: ({
      animeId, episodeNumber
    }: {
      animeId: KitsuAnime['id'], 
      episodeNumber: number
    }) => `kitsu:episode:${animeId}:${episodeNumber}`,
    episodes: ({
      animeId, offset, limit
    }: {
      animeId: KitsuAnime['id'], limit: number | string, offset: number
    }) => `kitsu:episodes:${animeId}:${limit}:${offset}`
  }
}