import { useLazyQuery } from "@apollo/client";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { GET_ANIME_LIST } from "@/lib/graphql/queries";
import { AnilistResponse } from "@/types/anilist";
import { Anime, AnimePageInfo } from "@/types/anime";
import { useCallback, useEffect, useRef } from "react";

export function useSearchAnime() {
    const initialRender = useRef<boolean>(false);

    const [genres] = useQueryState('genres', parseAsArrayOf(parseAsString));
    const [tags] = useQueryState('tags', parseAsArrayOf(parseAsString));
    const [sort] = useQueryState('sort', parseAsArrayOf(parseAsString));
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
    const [status] = useQueryState('status');
    const [year] = useQueryState('year');
    const [format] = useQueryState('format');
    const [season] = useQueryState('season');
    const [isAdult] = useQueryState('isAdult');
    const [source] = useQueryState('source');
    const [country] = useQueryState('country');
    const [score] = useQueryState('score');
    const [query] = useQueryState('query');

    const [executeQuery, { data, loading, error, refetch }] = useLazyQuery<
        AnilistResponse<"Page", { pageInfo: AnimePageInfo, media: Anime[] }>
    >(GET_ANIME_LIST);

    const buildQueryVariables = useCallback((overrideVars?: any) => {
        const baseVars = {
            search: query || undefined,
            page: page,
            sort: (sort && (sort?.length > 0)) ? sort : undefined,
            genres: (genres && (genres?.length > 0)) ? genres : undefined,
            tags: (tags && (tags?.length > 0)) ? tags : undefined,
            status: status || undefined,
            seasonYear: year ? parseInt(year) : undefined,
            format: format || undefined,
            season: season || undefined,
            isAdult: isAdult ? true : false || undefined,
            source: source || undefined,
            countryOfOrigin: country || undefined,
            score: score ? parseInt(score) : undefined,
        };
        
        return overrideVars ? { ...baseVars, ...overrideVars } : baseVars;
    }, [genres, tags, sort, status, year, format, season, isAdult, source, country, score, query, page]);

    const handleApplyFilters = useCallback((overrideVars?: any) => {
        const variables = buildQueryVariables({
            ...overrideVars,
            perPage: 15
        });
        executeQuery({ variables });
    }, [executeQuery, buildQueryVariables]);

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
            genres,
            tags,
            sort,
            status,
            year,
            format,
            season,
            isAdult,
            source,
            country,
            score
        }
    };
}