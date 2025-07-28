import { HianimeAnime } from "@better-melon/shared/types";
import { AnilistAnime } from "../../types/anilist";
import { KitsuAnimeInfo } from "../../types/kitsu";

export const cacheKeys = {
  anilist: {
    static: (anilistId: AnilistAnime['id']) => `anilist:static:${anilistId}`,
    dynamic: (anilistId: AnilistAnime['id']) => `anilist:dynamic:${anilistId}`
  },
  hianime: {
    info: (animeId: AnilistAnime['id']) => `hianime:info:${animeId}`,
    episodes: (animeId: HianimeAnime['id']) => `hianime:episodes:${animeId}`,
    sources: (episodeId: HianimeAnime['id']) => `hianime:sources:${episodeId}`
  },
  subtitle: {
    entries: (animeId: AnilistAnime['id']) => `subtitle:entries:${animeId}`,
    files: (entryId: number, episodeNumber: string) => `subtitle:files:${entryId}:${episodeNumber}`
  },
  kitsu: {
    info: (animeId: KitsuAnimeInfo['id']) => `kitsu:info:${animeId}`,
    episodes: ({
      animeId, offset, limit
    }: {
      animeId: KitsuAnimeInfo['id'], limit: number | string, offset: number
    }) => `kitsu:episodes:${animeId}:${limit}:${offset}`
  }
}