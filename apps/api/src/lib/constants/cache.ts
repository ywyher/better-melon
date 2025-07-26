import { AnilistAnimeData, AnilistAnimeStaticData } from "../../types/anilist";
import { HianimeAnimeEpisode } from "../../types/hianime";

export const cacheKeys = {
  anilist: {
    staticData: (anilistId: AnilistAnimeStaticData['id']) => `anilist:static-data:${anilistId}`
  },
  hianime: {
    info: (animeId: AnilistAnimeData['id']) => `hianime:info:${animeId}`,
    episodes: (animeId: AnilistAnimeData['id']) => `hianime:episodes:${animeId}`,
    sources: (episodeId: HianimeAnimeEpisode['episodeId']) => `hianime:sources:${episodeId}`
  },
  subtitle: {
    entries: (animeId: AnilistAnimeData['id']) => `subtitle:entries:${animeId}`,
    files: (entryId: number, episodeNumber: string) => `subtitle:files:${entryId}:${episodeNumber}`
  },
  kitsu: {
    info: (animeId: AnilistAnimeData['id']) => `kitsu:info:${animeId}`,
    episodes: ({
      animeId, offset, limit
    }: {
      animeId: AnilistAnimeData['id'], limit: number | string, offset: number
    }) => `kitsu:episodes:${animeId}:${limit}:${offset}`
  }
}