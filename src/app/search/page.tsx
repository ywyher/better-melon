"use client"

import AnimeFilters from "@/components/filters/filters";
import { Indicator } from "@/components/indicator";
import { Anime, AnimePageInfo } from "@/types/anime";
import { useLazyQuery } from "@apollo/client"
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { GET_ANIME_LIST } from "@/lib/graphql/queries";
import { AnilistResponse } from "@/types/anilist";
import { useCallback, useEffect, useRef } from "react";
import SearchHeader from "@/app/search/_components/header";
import SearchContent from "@/app/search/_components/content";
import SearchBar from "@/app/search/_components/search-bar";
import SearchPagination from "@/app/search/_components/pagination";

export default function Search() {
    const initialRender = useRef<boolean>(false)

    const [genres] = useQueryState('genres', parseAsArrayOf(parseAsString))
    const [tags] = useQueryState('tags', parseAsArrayOf(parseAsString))
    const [sort] = useQueryState('sort', parseAsArrayOf(parseAsString))
    
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
    const [status] = useQueryState('status')
    const [year] = useQueryState('year')
    const [format] = useQueryState('format')
    const [season] = useQueryState('season')
    const [isAdult] = useQueryState('isAdult')
    const [source] = useQueryState('source')
    const [country] = useQueryState('country')
    const [score] = useQueryState('score')
    const [query] = useQueryState('query')

    const [executeQuery, {
        data,
        loading,
        error,
        refetch
    }] = useLazyQuery<AnilistResponse<"Page", { pageInfo: AnimePageInfo, media: Anime[] }>>(GET_ANIME_LIST);

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
        })
    }, [setPage]);

    useEffect(() => {
        if(!initialRender.current) {
            initialRender.current = true
            handleApplyFilters();
        }
    }, [initialRender]);

    if (error)
        return (
            <Indicator message={error.message} type="error" onRetry={() => refetch()} />
        );

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <AnimeFilters 
                onApply={handleApplyFilters}
                className="lg:max-w-[400px]"
            />

            <div className="space-y-10 flex-1 pb-20">
                <div className="flex flex-col gap-5 flex-1">
                    <div className="flex flex-col gap-3">
                        <SearchHeader
                            query={query || ""}
                            animesLength={data?.Page.media.length || 0}
                        />
                        <SearchBar onApply={handleApplyFilters} />
                    </div>
                    <SearchContent 
                        isLoading={loading}
                        animes={data?.Page.media}
                    />
                </div>
                <SearchPagination 
                    pageInfo={data?.Page.pageInfo}
                    currentPage={page}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}