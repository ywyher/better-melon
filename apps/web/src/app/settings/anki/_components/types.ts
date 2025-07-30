import { z } from "zod"

export const ankiPresetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  deck: z.string().min(1, "Deck is required"),
  model: z.string().min(1, "Model is required"),
  fields: z.record(z.string(), z.string().optional()).optional(),
  isDefault: z.boolean(),
  isGui: z.boolean()
})

export type AnkiPresetSchema = z.infer<typeof ankiPresetSchema>