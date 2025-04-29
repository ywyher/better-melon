import { z } from "zod";

export type AnilistGetListQuery = {
  MediaList: {
    media: {
      episodes: number;
    };
    status: 
      'CURRENT'
    | 'PLANNING'
    | 'COMPLETED'
    | 'REPEATING'
    | 'PAUSED'
    | 'DROPPED';
    progress: number;
    startedAt: {
      year: number;
      month: number;
      day: number;
    };
    completedAt: {
      year: number;
      month: number;
      day: number;
    };
    score: number;
    repeat: number;
    notes: string;
  }
}

export const anielistStatusEnum = [
  'CURRENT',
  'PLANNING',
  'COMPLETED',
  'REPEATING',
  'PAUSED',
  'DROPPED'
] as const

export const anilistOptionsSchema = z.object({
  status: z.enum([...anielistStatusEnum]).nullable(),
  episodeProgress: z.number().nullable(),
  startedAt: z.date().nullable(),
  finishedAt: z.date().default(new Date()).nullable(),
  score: z.number().max(10).nullable(),
  totalRewatches: z.number().nullable(),
  notes: z.string().nullable()
}).partial()