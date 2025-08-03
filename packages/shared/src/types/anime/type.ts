import type { Static } from "@sinclair/typebox";
import type { animeDate, animeProvider } from "./schema";

export type AnimeDate = Static<typeof animeDate>
export type AnimeProvider = Static<typeof animeProvider>