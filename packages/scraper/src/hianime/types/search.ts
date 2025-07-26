import type { HianimeDate, HianimeFormat, HianimeGenre, HianimeLanguage, HianimeRated, HianimeScore, HianimeSeason, HianimeSort, HianimeStatus } from "./anime";

export type HianimeSearchProps = { 
  q: string, 
  page?: number, 
  filters?: HianimeSearchFilters
}

export type HianimeAnimeEpisodes = {
  sub: number
  dub: number
}

export type HanimeSearchQueryParams = Partial<{
  q: string;
  page: string;
  format: HianimeFormat;
  status: HianimeStatus;
  rated: HianimeRated;
  score: HianimeScore;
  season: HianimeSeason;
  language: HianimeLanguage;
  startDate: HianimeDate;
  endDate: HianimeDate;
  sort: HianimeSort;
  genres: HianimeGenre[];
}>

export type HianimeSearchFilters = Omit<HanimeSearchQueryParams, "q" | "page">;

export type HianimeFilterKeys = Partial<
  keyof Omit<HianimeSearchFilters, "startDate" | "endDate">
>;