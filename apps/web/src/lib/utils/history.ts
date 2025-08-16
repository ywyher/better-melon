import { History } from "@/lib/db/schema";
import { Activity } from "react-activity-calendar";

export function calculateTotalHours(medias: History[]): number {
  const totalSeconds = medias.reduce((sum, media) => {
    const duration = media.duration || 0
    return sum + duration
  }, 0)
  
  return Math.round((totalSeconds / 3600) * 10) / 10
}

export function calculateTotalAnimes(medias: History[]): number {
  const uniqueAnimeIds = new Set<string>()
  
  medias.forEach(media => {
    if (media.mediaId) {
      uniqueAnimeIds.add(media.mediaId)
    }
  })
  
  return uniqueAnimeIds.size
}

export function calculateTotalEpisodes(medias: History[]): number {
  return medias.length
}