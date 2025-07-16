import { Anime } from "@/types/anime";

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
    info: (animeId: string) => `anime:info:${animeId}`
  },
  pitch: {
    accent: (animeId: string, filename: string, chunk: number) => `pitch:accent:${animeId}:${filename}:${chunk}`
  }
}