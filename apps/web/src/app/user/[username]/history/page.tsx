'use client'

import HistoryStats from "@/app/user/[username]/history/components/stats";
import AnimeHistoryCard from "@/components/anime/card/history/card";
import AnimeCardSkeleton from "@/components/anime/card/default/skeleton";
import ProfileHistoryPagination from "@/app/user/[username]/history/components/pagination";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { getPercentage } from "@/lib/utils/utils";
import { profileQueries } from "@/lib/queries/profile";
import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ActivityCalendarWrapper from "@/components/activity-calendar-wrapper";
import { HistoryFilters } from "@/types/history";
import ProfileHistoryFilters from "@/app/user/[username]/history/components/filters/filters";
import { parseAsJson, useQueryState } from "nuqs";
import { dateRangeSchema } from "@/types";
import { StatsCardSkeleton } from "@/components/stats-card";

export default function ProfleHistory() {
  const params = useParams()
  const username = String(params.username)
  const [filters, setFilters] = useState<HistoryFilters>({
    page: 1,
    limit: 20,
  })
  const [, setDate] = useQueryState('date', parseAsJson(dateRangeSchema.parse))

  const { data, isLoading } = useQuery({
    ...profileQueries.history({ 
      username, 
      filters
    })
  })

  const history = useMemo(() => {
    if(!data) return []
    return data.history
  }, [data])

  const activity = useMemo(() => {
    if(!data) return []
    return data.activity
  }, [data])

  const pagination = useMemo(() => {
    if(!data) return null
    return data.pagination
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
    <Card className="bg-secondary">
      <CardHeader className="flex flex-col md:flex-row justify-between gap-3">
        <CardTitle className="text-2xl flex-1">History</CardTitle>
        <ProfileHistoryFilters setFilters={setFilters} />        
      </CardHeader>
      <HistoryStats animes={history} isLoading={isLoading} />
      <Separator />
      <CardContent className="flex flex-row flex-wrap gap-5">
        {isLoading && Array.from({ length: filters.limit }).map((_,idx) => <AnimeCardSkeleton key={idx} />)}
        {history && history.map((h, idx) => (
          <AnimeHistoryCard 
            key={idx}
            id={Number(h.animeId)}
            coverImage={h.animeCoverImage}
            title={h.animeTitle}
            episodeNumber={h.animeEpisode}
            percentage={getPercentage({ duration: h.duration, progress: h.progress })}
          />
        ))}
        {(!isLoading && !history?.length) && <>No entries found.</>}
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
            {history.length} entry found in page {pagination.currentPage}
          </div>
          <ProfileHistoryPagination pagination={pagination} />
        </CardFooter>
      )}
    </Card>
  )
}