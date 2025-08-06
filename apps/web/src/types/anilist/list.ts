import { AnimeDate } from "@better-melon/shared/types";

export type AnilistListStatus = 'CURRENT'
| 'PLANNING'
| 'COMPLETED'
| 'REPEATING'
| 'PAUSED'
| 'DROPPED'

export type AnilistList = {
  media: {
    mediaListEntry: {
      id: number
    }
    episodes: number;
  };
  status: AnilistListStatus;
  progress: number;
  startedAt: AnimeDate;
  completedAt: AnimeDate;
  score: number;
  repeat: number;
  notes: string;
}

export type AddAnimeToListVariables = { mediaId: number } & Partial<{
  status: string;
  progress: number;
  score: number;
  repeat: number;
  notes: string;
  startedAt: AnimeDate
  completedAt: AnimeDate
}>