import type { HianimeSearchFilters } from "@better-melon/shared/types";

export type HianimeSearchProps = { 
  q: string, 
  page?: number, 
  filters?: HianimeSearchFilters
}

export type HianimeFilterKeys = Partial<
  keyof Omit<HianimeSearchFilters, "startDate" | "endDate">
>;