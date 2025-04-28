import { z } from "zod";

const statusEnum = [
  'CURRENT',
  'PLANNING',
  'COMPLETED',
  'REPEATING',
  'PAUSED',
  'DROPPED'
] as const

export const anilistOptionsSchema = z.object({
  status: z.enum([...statusEnum]).nullable(),
  episodeProgress: z.number().nullable(),
  startDate: z.date().nullable(),
  endDate: z.date().default(new Date()).nullable(),
  score: z.number().max(10).nullable(),
  totalRewatches: z.number().nullable(),
  notes: z.string().nullable()
}).partial()