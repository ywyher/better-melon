import type { HianimeDate, HianimeGenre, HianimeLanguage, HianimeRated, HianimeScore, HianimeSeason, HianimeSort, HianimeStatus, HianimeType } from "./anime";

export type HianimeSearchProps = { 
  q: string, 
  page?: number, 
  filters?: HianimeSearchFilters
}

export type HanimeSearchQueryParams = Partial<{
  q: string;
  page: string;
  type: HianimeType;
  status: HianimeStatus;
  rated: HianimeRated;
  score: HianimeScore;
  season: HianimeSeason;
  language: HianimeLanguage;
  start_date: HianimeDate;
  end_date: HianimeDate;
  sort: HianimeSort;
  genres: HianimeGenre[];
}>

export type HianimeSearchFilters = Omit<HanimeSearchQueryParams, "q" | "page">;

export type HianimeFilterKeys = Partial<
  keyof Omit<HianimeSearchFilters, "start_date" | "end_date">
>;