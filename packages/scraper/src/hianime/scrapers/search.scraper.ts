import ky from "ky";
import { extractHianimeAnimes, getHianimeSearchUrl } from "../utils/search.utils";
import { load } from "cheerio";
import type { HianimeSearchResponse } from "../types";
import type { HianimeSearchProps } from "../types/search";

export async function hianimeSearch({ 
  q,
  page,
  filters
}: HianimeSearchProps): Promise<HianimeSearchResponse> {
  const response: HianimeSearchResponse = {
    animes: [],
    searchQuery: q,
    filters,
    totalPages: 0,
    hasNextPage: false,
    currentPage: (Number(page) || 0) < 1 ? 1 : Number(page),
  }

  const url = getHianimeSearchUrl({
    q,
    page,
    filters,
  })

  try {
    const content = await ky.get(url.href).text()
    const $ = load(content)
    const animes = extractHianimeAnimes($)
    response.animes = animes;

    const hasNextPage = 
      $(".pagination > li").length > 0
          ? $(".pagination li.active").length > 0
              ? $(".pagination > li").last().hasClass("active")
                  ? false
                  : true
              : false
          : false; 
    response.hasNextPage = hasNextPage;
    
    const totalPages =
      Number(
        $('.pagination > .page-item a[title="Last"]')
          ?.attr("href")
          ?.split("=")
          .pop() ??
          $('.pagination > .page-item a[title="Next"]')
            ?.attr("href")
            ?.split("=")
            .pop() ??
          $(".pagination > .page-item.active a")?.text()?.trim()
      ) || 1;
    response.totalPages = totalPages;

    return response;
  } catch (error) {
    throw error;
  }
}