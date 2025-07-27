import { Type as t } from "@sinclair/typebox"
import { hianimeAnime, hianimeFormat, hianimeGenre, hianimeLanguage, hianimeRated, hianimeScore, hianimeSeason, hianimeSort, hianimeStatus } from "../anime/schema"
import { animeDate } from "../../anime/schema";

export const hanimeSearchParams = t.Partial(
  t.Object({
    q: t.String(),
    page: t.String(),
    format: hianimeFormat,
    status: hianimeStatus,
    rated: hianimeRated,
    score: hianimeScore,
    season: hianimeSeason,
    language: hianimeLanguage,
    startDate: animeDate,
    endDate: animeDate,
    sort: hianimeSort,
    genres: t.Array(hianimeGenre),
  })
)

export const hianimeSearchFilters = t.Omit(hanimeSearchParams, ['q', 'page']);

export const hianimeSearchResponse = t.Object({
  animes: t.Array(t.Partial(hianimeAnime)),
  searchQuery: t.String(),
  filters: t.Optional(hianimeSearchFilters), 
  totalPages: t.Any(Number),
  hasNextPage: t.Any(Boolean),
  currentPage: t.Number()
})