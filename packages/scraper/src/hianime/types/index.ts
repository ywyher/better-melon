import type { HianimeAnime } from "./anime"
import type { HianimeSearchFilters } from "./search";

export type HianimeSearchResponse = {
  animes: Partial<HianimeAnime>[]
  searchQuery: string;
  filters?: HianimeSearchFilters; 
  totalPages: number;
  hasNextPage: boolean;
  currentPage: number
}