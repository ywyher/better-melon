import { textShadowTypes } from "@/app/settings/subtitle/_subtitle-styles/constants";
import { subtitleTranscriptions } from "@/lib/constants/subtitle";
import { z } from "zod";

export const subtitleStylesSchema = z.object({
  transcription: z.enum([...subtitleTranscriptions, 'all']).default('all'),

  fontSize: z.number().min(0).max(90).default(16),
  fontFamily: z.string().min(1, { message: "Font family is required" }).default("Arial"),

  textColor: z.string().default("#FFFFFF"),
  textShadow: z.enum(textShadowTypes).default("outline"),
  textOpacity: z.number().min(0).max(1).default(1),

  backgroundColor: z.string().default("#000000"),
  backgroundOpacity: z.number().min(0).max(1).default(0.5),
  backgroundBlur: z.number().min(0).max(30).default(2),
  backgroundRadius: z.number().min(0).max(30).default(6),
})

