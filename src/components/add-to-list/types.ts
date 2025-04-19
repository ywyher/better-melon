import { z } from "zod";

const statusEnum = ['watching', 'plan-to-watch', 'completed', 're-watching', 'paused', 'dropped'] as const

export const anilistOptionsSchema = z.object({
    status: z.enum([...statusEnum]),
    episodeProgress: z.number(),
    startDate: z.date(),
    endDate: z.date().default(new Date()),
    score: z.number().min(0).max(10),
    totalRewatches: z.number(),
    notes: z.string()
})