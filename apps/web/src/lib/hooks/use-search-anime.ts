import { useLazyQuery } from "@apollo/client";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { Anime } from "@/types/anime";
import { useCallback, useEffect, useRef } from "react";
import { AnilistPageInfo } from "@/types/anilist";
import { AnilistResponse, AnilistSort, AnilistGenre, AnilistTag, AnilistStatus, AnilistFormat, AnilistSeason, AnilistSource } from "@better-melon/shared/types";
import { GET_ANIME_LIST } from "@/lib/graphql/queries";
import { AnilistCountry } from "@/types/anilist/anime";
import { SearchFilters } from "@/types/search";
import { queryVariables } from "@/lib/constants/anime";

export function useSearchAnime() {
    const initialRender = useRef<boolean>(false);

    const [genres] = useQueryState('genres', parseAsArrayOf(parseAsString));
    const [tags] = useQueryState('tags', parseAsArrayOf(parseAsString));
    const [sorts] = useQueryState('sorts', parseAsArrayOf(parseAsString));
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
    const [status] = useQueryState('status');
    const [year] = useQueryState('year');
    const [format] = useQueryState('format');
    const [season] = useQueryState('season');
    const [isAdult] = useQueryState('isAdult');
    const [source] = useQueryState('source');
    const [country] = useQueryState('country');
    const [averageScore] = useQueryState('averageScore');
    const [query] = useQueryState('query');

    const [executeQuery, { data, loading, error, refetch }] = useLazyQuery<
        AnilistResponse<"Page", { pageInfo: AnilistPageInfo, media: Anime[] }>
    >(GET_ANIME_LIST);

    const handleApplyFilters = useCallback((overrides?: Partial<SearchFilters>) => {
        const filters: SearchFilters = {
            query,
            page: page,
            sorts: sorts as AnilistSort[],
            genres: genres as AnilistGenre[],
            tags: tags as AnilistTag[],
            status: status as AnilistStatus,
            seasonYear: Number(year),
            format: format as AnilistFormat,
            season: season as AnilistSeason,
            isAdult: isAdult === 'true' ? true : isAdult === 'false' ? false : undefined,
            source: source as AnilistSource,
            countryOfOrigin: country as AnilistCountry,
            averageScore: Number(averageScore),
            ...overrides
        };

        const variables = queryVariables.list.search(filters);
        executeQuery({ variables });
    }, [query, page, sorts, genres, tags, status, year, format, season, isAdult, source, country, averageScore]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        handleApplyFilters({
            page: newPage
        });
    }, [setPage, handleApplyFilters]);

    useEffect(() => {
        if (!initialRender.current) {
            initialRender.current = true;
            handleApplyFilters();
        }
    }, [handleApplyFilters]);

    return {
        animes: data?.Page.media,
        pageInfo: data?.Page.pageInfo,
        
        loading,
        error,
        query: query || "",
        currentPage: page,
        
        handleApplyFilters,
        handlePageChange,
        refetch,
        
        filters: {
            genres: genres as AnilistGenre[],
            tags: tags as AnilistTag[],
            sorts: sorts as AnilistSort[],
            status: status as AnilistStatus,
            year,
            format: format as AnilistFormat,
            season: season as AnilistSeason,
            isAdult,
            source: source as AnilistSource,
            country: country as AnilistCountry,
            averageScore
        }
    };
}