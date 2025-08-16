'use client'

import WordCard from "@/app/user/[username]/words/components/word-card";
import WordCardSkeleton from "@/app/user/[username]/words/components/word-card-skeleton";
import ProfileWordsFilters from "@/app/user/[username]/words/components/filters/filters";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import { WordFilters } from "@/types/word";
import { profileQueries } from "@/lib/queries/profile";
import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileWordsPagination from "@/app/user/[username]/words/components/pagination";
import ActivityCalendarWrapper from "@/components/activity-calendar-wrapper";
import { parseAsJson, useQueryState } from "nuqs";
import { dateRangeSchema } from "@/types";
import ProfileWordsStats from "@/app/user/[username]/words/components/stats";
import { StatsCardSkeleton } from "@/components/stats-card";

export default function ProfileWords() {
  const params = useParams()
  const username = String(params.username)
  const [filters, setFilters] = useState<WordFilters>({
    page: 1,
    limit: 20,
  })
  const [, setDate] = useQueryState('date', parseAsJson(dateRangeSchema.parse))
  
  const { data, isLoading } = useQuery({
    ...profileQueries.words({
      username,
      filters
    })
  })

  const words = useMemo(() => {
    if(!data) return []
    return data.words
  }, [data])

  const pagination = useMemo(() => {
    if(!data) return null
    return data.pagination
  }, [data])

  const activity = useMemo(() => {
    if(!data) return []
    return data.activity
  }, [data])

  const handleDateClick = useCallback((d: string) => {
    setDate({
      from: d,
      to: d
    })
    setFilters({
      ...filters,
      date: {
        from: d,
        to: d
      }
    })
  }, [filters])

  return (
    <Card className="w-full bg-secondary">
      <CardHeader className="flex flex-col gap-3 justify-between">
        <CardTitle className="text-2xl flex-1">Mined Words</CardTitle>
        <ProfileWordsFilters setFilters={setFilters} />
      </CardHeader>
      <ProfileWordsStats words={words} isLoading={isLoading} />
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {isLoading ? (
            <>{Array.from({ length: filters.limit }, (_, idx) => <WordCardSkeleton key={`skeleton-${idx}`} />)}</>
          ) : (
            words && words.map((w, idx) => (
              <WordCard 
                key={idx}
                word={w}
              />
            ))
          )}
        </div>
        {(!isLoading && !words?.length) && <>No entries found.</>}
      </CardContent>
      <Separator />
      <ActivityCalendarWrapper
        className="flex justify-center items-center"
        entries={activity}
        isLoading={isLoading}
        hideColorLegend={true}
        hideTotalCount={true}
        hideMonthLabels={true}
        showWeekdayLabels={false}
        onDateClick={(d) => handleDateClick(d)}
      />
      <Separator />
      {pagination && (
        <CardFooter className="flex flex-row justify-between">
          <div className="flex flex-row w-full gap-2 text-muted-foreground">
            {words.length} entry found in page {pagination.currentPage}
          </div>
          <ProfileWordsPagination 
            pagination={pagination}
            filters={filters}
            setFilters={setFilters}
          />
        </CardFooter>
      )}
    </Card>
  )
}