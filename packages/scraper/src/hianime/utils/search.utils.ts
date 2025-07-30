import { HIANIME_FILTERS_MAP } from "./filters.mapper";
import type { CheerioAPI } from "cheerio";
import { hianimeConfig } from "./config";
import type { HianimeFilterKeys, HianimeSearchProps } from "../types/search";
import type { AnimeDate, HianimeAnime, HianimeFormat, HianimeGenre, HianimeSearchFilters, HianimeTitle } from "@better-melon/shared/types";

export function getHianimeSearchDateFilterValue({
    category,
    value    
}: {
    category: 's' | 'e'
    value: AnimeDate
}) {
    const { day, month, year } = value
    
    return [
        Number(year) > 0 ? `${category}y=${year}` : "",
        Number(month) > 0 ? `${category}m=${month}` : "",
        Number(day) > 0 ? `${category}d=${day}` : "",
    ].filter((d) => Boolean(d));
}

export function getHianimeSearchGenresFilterValue({
    value    
}: {
    value: HianimeGenre[]
}) {
    return value
      .map((genre: HianimeGenre) => HIANIME_FILTERS_MAP["GENRE"][genre as keyof typeof HIANIME_FILTERS_MAP.GENRE])
      .join(",");
}

export function getHianimeSearchFilterValue({
    key,
    rawValue
}: {
    key: HianimeFilterKeys,
    rawValue: string
}): string | undefined {
    rawValue = rawValue.trim();
    if (!rawValue) return undefined;
    
    switch (key) {
        case "format": {
            const val = HIANIME_FILTERS_MAP["FORMAT"][rawValue as keyof typeof HIANIME_FILTERS_MAP.FORMAT] ?? 0;
            return val === 0 ? undefined : `${val}`;
        }
        case "status": {
            const val = HIANIME_FILTERS_MAP["STATUS"][rawValue as keyof typeof HIANIME_FILTERS_MAP.STATUS] ?? 0;
            return val === 0 ? undefined : `${val}`;
        }
        case "rated": {
            const val = HIANIME_FILTERS_MAP["RATED"][rawValue as keyof typeof HIANIME_FILTERS_MAP.RATED] ?? 0;
            return val === 0 ? undefined : `${val}`;
        }
        case "score": {
            const val = HIANIME_FILTERS_MAP["SCORE"][rawValue as keyof typeof HIANIME_FILTERS_MAP.SCORE] ?? 0;
            return val === 0 ? undefined : `${val}`;
        }
        case "season": {
            const val = HIANIME_FILTERS_MAP["SEASON"][rawValue as keyof typeof HIANIME_FILTERS_MAP.SEASON] ?? 0;
            return val === 0 ? undefined : `${val}`;
        }
        case "language": {
            const val = HIANIME_FILTERS_MAP["LANGUAGE"][rawValue as keyof typeof HIANIME_FILTERS_MAP.LANGUAGE] ?? 0;
            return val === 0 ? undefined : `${val}`;
        }
        case "sort": {
            return HIANIME_FILTERS_MAP["SORT"][rawValue as keyof typeof HIANIME_FILTERS_MAP.SORT] ?? undefined;
        }
        default:
            return undefined;
    }
}

export function extractHianimeAnimes($: CheerioAPI): Partial<HianimeAnime>[] {
  const items = $("#main-content .tab-content .film_list-wrap .flw-item")

  const animes: Partial<HianimeAnime>[] = [];

  items.each((_, item) => {
    const animeId = $(item)  
      .find(".film-detail .film-name .dynamic-name")
      ?.attr("href")
      ?.slice(1)
      .split("?ref=search")[0] || undefined;

    const title = {
      english: $(item)
        .find(".film-detail .film-name .dynamic-name")
        ?.text()
        ?.trim(),
      native:
        $(item)
          .find(".film-detail .film-name .dynamic-name")
          ?.attr("data-jname")
          ?.trim() || undefined,
    } as HianimeTitle;

    const poster = $(item)
      .find(".film-poster .film-poster-img")
      ?.attr("data-src")
      ?.trim() || undefined;

    const duration = $(item)
      .find(".film-detail .fd-infor .fdi-item.fdi-duration")
      ?.text()
      ?.trim();

    const format = $(item)
      .find(".film-detail .fd-infor .fdi-item:nth-of-type(1)")
      ?.text()
      ?.trim() as HianimeFormat;

    const episodes = {
      sub:
        Number(
          $(item)
            .find(".film-poster .tick-sub")
            ?.text()
            ?.trim()
            .split(" ")
            .pop()
        ) || undefined,
      dub:
        Number(
          $(item)
            .find(".film-poster .tick-dub")
            ?.text()
            ?.trim()
            .split(" ")
            .pop()
        ) || undefined
    } as {
      sub: number
      dub: number
    };

    animes.push({
      id: animeId,
      title,
      poster,
      duration,
      format,
      episodes
    })
  })

  return animes;
}

export function getHianimeSearchUrl({
  q,
  page,
  filters
}: HianimeSearchProps) {
  const url = new URL(hianimeConfig.url.search);
  url.searchParams.set("keyword", q);
  url.searchParams.set("page", `${(Number(page) || 0) < 1 ? 1 : Number(page)}`);
  url.searchParams.set("sort", "default");

  for (const key in filters) {
    if (key === "genres") {
      const genres = getHianimeSearchGenresFilterValue({
        value: filters.genres as HianimeGenre[]  || ""
      });
      url.searchParams.set("genres", genres);
      if (!genres) continue;
      continue;
    }

    if (key === "startDate" || key === "endDate") {
      const isStartDate = key == 'startDate'
      const category = isStartDate ? "s" : "e"
      const date = isStartDate ? filters.startDate : filters.endDate;
      if(!date) continue;

      const dates = getHianimeSearchDateFilterValue({
        category,
        value: date
      });
      dates.map(date => {
        const [key, val] = date.split("=");
        if(!key || !val) return;
        url.searchParams.set(key, val);
      })
      continue;
    }

    const filterVal = getHianimeSearchFilterValue({
      key: key as HianimeFilterKeys,
      rawValue: filters[key as keyof Omit<HianimeSearchFilters, 'genres' | 'startDate' | 'endDate'>] || ""
    });
    filterVal && url.searchParams.set(key == 'format' ? 'type' : key, filterVal);
  }

  return url
}