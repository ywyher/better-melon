import { Nullable } from "@/types";
import { AnilistCountry } from "@/types/anilist/anime";
import { AnilistFormat, AnilistGenre, AnilistSeason, AnilistSort, AnilistSource, AnilistStatus, AnilistTag } from "@better-melon/shared/types";

export type SearchFilters = Nullable<Partial<{
  query: string;
  page: number;
  sorts: AnilistSort[];
  genres: AnilistGenre[]
  tags: AnilistTag[]
  status: AnilistStatus
  seasonYear: number
  format: AnilistFormat
  season: AnilistSeason
  isAdult: boolean
  source: AnilistSource
  countryOfOrigin: AnilistCountry
  averageScore: number
}>>