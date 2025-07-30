import type { AnilistNextAiringEpisode } from "../types";

export function getNextAiringEpisodeTTL(nextAiringEpisode?: AnilistNextAiringEpisode): number {
  return nextAiringEpisode
    ? Math.max(nextAiringEpisode.timeUntilAiring, 60)
    : 1800;
}