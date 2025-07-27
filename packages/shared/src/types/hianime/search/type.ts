import type { Static } from "@sinclair/typebox"
import type { hanimeSearchParams, hianimeSearchFilters, hianimeSearchResponse } from "./schema"

export type HanimeSearchParams = Static<typeof hanimeSearchParams>
export type HianimeSearchFilters = Static<typeof hianimeSearchFilters>
export type HianimeSearchResponse = Static<typeof hianimeSearchResponse>