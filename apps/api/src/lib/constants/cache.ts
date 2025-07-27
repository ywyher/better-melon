import { AnilistAnimeData } from "../../types/anilist";
import { HianimeAnimeData, HianimeAnimeEpisode } from "../../types/hianime";
import { KitsuAnimeInfo } from "../../types/kitsu";

export const cacheKeys = {
  anilist: {
    staticData: (anilistId: AnilistAnimeData['id']) => `anilist:static-data:${anilistId}`
  },
  hianime: {
    info: (animeId: AnilistAnimeData['id']) => `hianime:info:${animeId}`,
    episodes: (animeId: HianimeAnimeData['id']) => `hianime:episodes:${animeId}`,
    sources: (episodeId: HianimeAnimeEpisode['id']) => `hianime:sources:${episodeId}`
  },
  subtitle: {
    entries: (animeId: AnilistAnimeData['id']) => `subtitle:entries:${animeId}`,
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