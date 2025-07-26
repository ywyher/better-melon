import { Anime, AnimeInListVariables, AnimeSort } from "@/types/anime";

export const cacheKeys = {
  subtitle: ({
    animeId,
    episodeNumber,
    name
  }: {
    name: string,
    animeId: Anime['id'],
    episodeNumber: number
  }) => `subtitle:${animeId}:${episodeNumber}:${name}`,
  
  anime: {
    staticData: (animeId: string) => `anime:static-data:${animeId}`,
    topTrending: () => `anime:top-trending`,
    list: (variables: AnimeInListVariables) => {
      // Sort entries by key to ensure consistent ordering
      const sortedEntries = Object.entries(variables).sort(([a], [b]) => a.localeCompare(b));
      return `anime:list:${sortedEntries.flat().join(',')}`;
    },
  },
  
  pitch: {
    accent: (animeId: string, filename: string, chunk: number) => `pitch:accent:${animeId}:${filename}:${chunk}`
  }
}