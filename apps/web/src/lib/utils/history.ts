import { History } from "@/lib/db/schema";

export function calculateTotalHours(animes: History[]): number {
  const totalSeconds = animes.reduce((sum, anime) => {
    const duration = anime.duration || 0
    return sum + duration
  }, 0)
  
  return Math.round((totalSeconds / 3600) * 10) / 10
}

export function calculateTotalAnimes(animes: History[]): number {
  const uniqueAnimeIds = new Set<string>()
  
  animes.forEach(anime => {
    if (anime.animeId) {
      uniqueAnimeIds.add(anime.animeId)
    }
  })
  
  return uniqueAnimeIds.size
}

export function calculateTotalEpisodes(animes: History[]): number {
  return animes.length
}