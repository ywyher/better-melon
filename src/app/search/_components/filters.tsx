"use client"

import CountryFilter from "@/app/search/_components/filters/country";
import FormatFilter from "@/app/search/_components/filters/format";
import GenresFilter from "@/app/search/_components/filters/genres";
import IsAdultFilter from "@/app/search/_components/filters/is-adult";
import SeasonFilter from "@/app/search/_components/filters/season";
import SortFilter from "@/app/search/_components/filters/sort";
import SourceFilter from "@/app/search/_components/filters/source";
import StatusFilter from "@/app/search/_components/filters/status";
import TagsFilter from "@/app/search/_components/filters/tags";
import YearFilter from "@/app/search/_components/filters/year";
import { Button } from "@/components/ui/button";
import { animeFormats, animeSeasons, animeSources, animeStatuses } from "@/lib/constants/anime";
import { AnimeCountry, AnimeFormat, AnimeSeason, AnimeSource, AnimeStatus } from "@/types/anime";
import { parseAsArrayOf, parseAsBoolean, parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { useState } from "react";

type AnimeFiltersProps = {
    refetch: () => void
}

export default function AnimeFilters({ refetch }: AnimeFiltersProps) {
    // single selector
    const [queryStatus, setQueryStatus] = useQueryState<AnimeStatus>('status',
        parseAsStringEnum<AnimeStatus>(animeStatuses)
    )
    const [status, setStatus] = useState<AnimeStatus | null>(null)

    const [queryYear, setQueryYear] = useQueryState('year')
    const [year, setYear] = useState<string | null>('')

    const [queryFormat, setQueryFormat] = useQueryState<AnimeFormat>('format',
        parseAsStringEnum<AnimeFormat>(animeFormats)
    )
    const [format, setFormat] = useState<AnimeFormat | null>(null)

    const [querySeason, setQuerySeason] = useQueryState<AnimeSeason>('season',
        parseAsStringEnum<AnimeSeason>(animeSeasons)
    )
    const [season, setSeason] = useState<AnimeSeason | null>(null)

    const [querySource, setQuerySource] = useQueryState<AnimeSource>('source',
        parseAsStringEnum<AnimeSource>(animeSources)
    )
    const [source, setSource] = useState<AnimeSource | null>(null)
    
    const [queryIsAdult, setQueryIsAdult] = useQueryState<boolean>('isAdult', parseAsBoolean)
    const [isAdult, setIsAdult] = useState<boolean | null>(null)
    
    const [queryCountry, setQueryCountry] = useQueryState<AnimeCountry>('country',
        parseAsStringEnum<AnimeCountry>(["CN", "JP", "KR", "TW"])
    )
    const [country, setCountry] = useState<AnimeCountry | null>(null)

    const [queryScore, setQueryScore] = useQueryState<number>('score', parseAsInteger)
    const [score] = useState<number | null>(null)
    
    const [query, setQuery] = useQueryState('query')

    // multiple selector
    const [queryGenres, setQueryGenres] = useQueryState('genres', parseAsArrayOf(parseAsString))
    const [genres, setGenres] = useState<string[] | null>([])

    const [queryTags, setQueryTags] = useQueryState('tags', parseAsArrayOf(parseAsString))
    const [tags, setTags] = useState<string[] | null>([])

    const [querySort, setQuerySort] = useQueryState('sort', parseAsArrayOf(parseAsString))
    const [sort, setSort] = useState<string[] | null>([])


    const handleApply = () => {
        // single selector
        setQueryStatus(status ? status : null)
        setQueryYear(year ? year : null)
        setQueryFormat(format ? format : null)
        setQuerySeason(season ? season : null)
        setQueryIsAdult(isAdult ? isAdult : null)
        setQuerySource(source ? source : null)
        setQueryCountry(country ? country : null)
        setQueryScore(score ? score : null)
        console.log(queryScore)
        console.log(query)

        // multiple selector
        setQueryGenres(genres?.length ? genres : null)
        setQueryTags(tags?.length ? tags : null)
        setQuerySort(sort?.length ? sort : null)

        refetch()
    }

    const handleReset = () => {
        setQueryFormat(null)
        setQueryStatus(null)
        setQueryYear(null)
        setQuerySeason(null)
        setQueryIsAdult(null)
        setQuerySource(null)
        setQueryCountry(null)
        setQueryScore(null)
        setQuery(null)

        setQueryGenres(null)
        setQueryTags(null)
        setQuerySort(null)

        refetch()
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-2">
                <GenresFilter
                    queryGenres={queryGenres}
                    genres={genres}
                    setGenres={setGenres}
                />
                <TagsFilter
                    queryTags={queryTags}
                    tags={tags}
                    setTags={setTags}
                />
            </div>
            <div className="flex flex-row gap-2">
                <StatusFilter 
                    queryStatus={queryStatus}
                    setStatus={setStatus}
                />
                <YearFilter 
                    queryYear={queryYear}
                    setYear={setYear}
                />
            </div>
            <div className="flex flex-row gap-2">
                <FormatFilter 
                    queryFormat={queryFormat}
                    setFormat={setFormat}
                />
                <SeasonFilter 
                    querySeason={querySeason}
                    setSeason={setSeason}
                />
            </div>
            <div className="flex flex-row gap-2">
                <IsAdultFilter 
                    queryIsAdult={queryIsAdult}
                    setIsAdult={setIsAdult}
                />
                <SourceFilter 
                    querySource={querySource}
                    setSource={setSource}
                />
            </div>
            <div className="flex flex-row gap-2">
                <SortFilter 
                    querySort={querySort}
                    sort={sort}
                    setSort={setSort}
                />
                <CountryFilter 
                    queryCountry={queryCountry}
                    setCountry={setCountry}
                />
            </div>
            {/* <div className="flex flex-row gap-2">
                <ScoreFilter
                    queryScore={queryScore}
                    setScore={setScore}
                />
            </div> */}
            <div className="flex flex-row gap-2">
                <Button 
                    onClick={handleApply} 
                    className="flex-1"
                >
                    Apply
                </Button>
                <Button 
                    variant='destructive'
                    onClick={handleReset} 
                    className="flex-1"
                >
                    Reset
                </Button>
            </div>
        </div>
    )
}