import { anilistListStatusEnum } from "@/lib/constants/anime-list";
import { z } from "zod";

export const anilistOptionsSchema = z.object({
  status: z.enum([...anilistListStatusEnum]).nullable(),
  episodeProgress: z.number().nullable(),
  startedAt: z.date().nullable(),
  finishedAt: z.date().default(new Date()).nullable(),
  score: z.number().max(10).nullable(),
  totalRewatches: z.number().nullable(),
  notes: z.string().nullable()
}).partial()