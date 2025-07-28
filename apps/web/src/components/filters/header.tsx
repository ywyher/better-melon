"use client"

import { AccordionTrigger } from "@/components/ui/accordion";
import { Filter, X, ListFilterPlus } from "lucide-react";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from "nuqs";

interface FiltersHeaderProps {
  onApply: (variables?: any) => void;
}

export default function FiltersHeader({ onApply }: FiltersHeaderProps) {
  const [genres, setGenres] = useQueryState('genres', parseAsArrayOf(parseAsString))
  const [tags, setTags] = useQueryState('tags', parseAsArrayOf(parseAsString))
  const [sorts, setSorts] = useQueryState('sorts', parseAsArrayOf(parseAsString))
  const [status, setStatus] = useQueryState('status')
  const [year, setYear] = useQueryState('year')
  const [format, setFormat] = useQueryState('format')
  const [season, setSeason] = useQueryState('season')
  const [isAdult, setIsAdult] = useQueryState('isAdult')
  const [source, setSource] = useQueryState('source')
  const [country, setCountry] = useQueryState('country')
  const [score, setScore] = useQueryState('score')
  const [, setQuery] = useQueryState('query')
  const [, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const activeFilters = [
    genres?.length ? 1 : 0,
    tags?.length ? 1 : 0,
    sorts?.length ? 1 : 0,
    status ? 1 : 0,
    year ? 1 : 0,
    format ? 1 : 0,
    season ? 1 : 0,
    isAdult ? 1 : 0,
    source ? 1 : 0,
    country ? 1 : 0,
    score ? 1 : 0,
  ].reduce((sum, filter) => sum + filter, 0)

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    setGenres(null)
    setTags(null)
    setSorts(null)
    setStatus(null)
    setYear(null)
    setFormat(null)
    setSeason(null)
    setIsAdult(null)
    setSource(null)
    setCountry(null)
    setScore(null)
    setQuery(null)
    setPage(null)

    onApply({
      genres: undefined,
      tags: undefined,
      sorts: undefined,
      status: undefined,
      year: undefined,
      format: undefined,
      season: undefined,
      isAdult: undefined,
      source: undefined,
      country: undefined,
      score: undefined,
      query: undefined,
      page: 1
    })
  }

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPage(null)
    onApply({
      page: 1
    })
  }

  return (
    <AccordionTrigger 
      className="flex flex-row items-center justify-between gap-3 cursor-pointer hover:no-underline [&>svg]:hidden"
    >
      <div className="flex flex-row items-center gap-1">
        <Filter size={18} />
        <p className="text-xl">Filters</p>
        {activeFilters > 0 && (
          <span className="text-sm text-muted-foreground">({activeFilters})</span>
        )}
      </div>
      <div className="flex flex-row items-center gap-2">
        {activeFilters > 0 && (
          <div 
            onClick={handleReset}
            className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-3 flex-1 text-muted-foreground"
          >
            <X size={16} className="mr-1" />
            Clear
          </div>
        )}
        <div
          onClick={handleApply}
          className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-3 flex-1 text-accent-foreground"
        >
          <ListFilterPlus size={16} className="mr-1" />
          Apply
        </div>
      </div>
    </AccordionTrigger>
  )
}