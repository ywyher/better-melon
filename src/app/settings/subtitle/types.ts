import { textShadowTypes } from "@/lib/constants";
import { z } from "zod";

export const fontSchema = z.object({
  size: z.number().min(1).max(90).default(16),
  family: z.string().default("Arial"),
});

export const textSchema = z.object({
  color: z.string().default("#FFFFFF"),
  opacity: z.number().min(0).max(1).default(1),
  shadow: z.enum(textShadowTypes).default("outline"),
});

export const backgroundSchema = z.object({
  color: z.string().default("#000000"),
  opacity: z.number().min(0).max(1).default(0.5),
  blur: z.number().min(1).max(30).default(2),
  radius: z.number().min(1).max(30).default(6),
});

export const subtitleSettingsSchema = z.object({
  fontSize: z.number().min(1).max(90).default(16),
  fontFamily: z.string().default("Arial"),

  textColor: z.string().default("#FFFFFF"),
  textShadow: z.enum(textShadowTypes).default("outline"),
  textOpacity: z.number().min(0).max(1).default(1),

  backgroundColor: z.string().default("#000000"),
  backgroundOpacity: z.number().min(0).max(1).default(0.5),
  backgroundBlur: z.number().min(1).max(30).default(2),
  backgroundRadius: z.number().min(1).max(30).default(6),

  isGlobal: z.boolean().default(false),
})