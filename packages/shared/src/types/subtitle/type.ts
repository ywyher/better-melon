import type { Static } from "@sinclair/typebox";
import type { subtitleEntry, subtitleFile } from "./schema";

export type SubtitleFile = Static<typeof subtitleFile>
export type SubtitleEntry = Static<typeof subtitleEntry>