import type { Static } from "@sinclair/typebox";
import type { streamingData } from "./schema";

export type StreamingData = Static<typeof streamingData>