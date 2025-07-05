import { ActiveSubtitleFile } from "@/types/subtitle";

export const cacheKeys = {
  subtitle: (key: string) => `subtitle:${key}`,
  anime: {
    info: (animeId: string) => `anime:info:${animeId}`
  },
  pitch: {
    accent: (animeId: string, filename: string, chunk: number) => `pitch:accent:${animeId}:${filename}:${chunk}`
  }
}