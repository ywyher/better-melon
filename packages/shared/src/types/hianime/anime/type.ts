import type { Static } from "@sinclair/typebox";
import type { hianimeAnime, hianimeFormat, hianimeGenre, hianimeLanguage, hianimeRated, hianimeScore, hianimeSeason, hianimeSort, hianimeStatus, hianimeTitle } from "./schema";

export type HianimeSort = Static<typeof hianimeSort>
export type HianimeLanguage = Static<typeof hianimeLanguage>
export type HianimeStatus = Static<typeof hianimeStatus>
export type HianimeFormat = Static<typeof hianimeFormat>
export type HianimeSeason = Static<typeof hianimeSeason>
export type HianimeGenre = Static<typeof hianimeGenre>
export type HianimeScore = Static<typeof hianimeScore>
export type HianimeTitle = Static<typeof hianimeTitle>
export type HianimeRated = Static<typeof hianimeRated>
export type HianimeAnime = Static<typeof hianimeAnime>