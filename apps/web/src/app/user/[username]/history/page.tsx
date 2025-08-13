'use client'

import HistoryStats from "@/app/user/[username]/history/components/stats";
import AnimeHistoryCard from "@/components/anime/card/history/card";
import AnimeCardSkeleton from "@/components/anime/card/default/skeleton";
import ProfileHistorySearchBar from "@/app/user/[username]/history/components/search-bar";
import ProfileHistoryPagination from "@/app/user/[username]/history/components/pagination";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { getPercentage } from "@/lib/utils/utils";
import { profileQueries } from "@/lib/queries/profile";
import { parseAsInteger, useQueryState } from "nuqs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfleHistory() {
  const params = useParams()
  const username = String(params.username)
  const [query] = useQueryState('query')
  const [page] = useQueryState('page', parseAsInteger.withDefault(1))

  const { data, isLoading } = useQuery({
    ...profileQueries.history({ 
      username, 
      search: query ?? undefined,
      page,
      limit: 20
    })
  })

  const history = useMemo(() => {
    if(!data) return []
    return data.history
  }, [data])

  const pagination = useMemo(() => {
    if(!data) return null
    return data.pagination
  }, [data])

  return (
    <Card className="bg-secondary">
      <CardHeader className="flex flex-row justify-between gap-3">
        <CardTitle className="text-2xl flex-1">History</CardTitle>
        <ProfileHistorySearchBar />
      </CardHeader>
      <HistoryStats medias={history} />
      <Separator />
      <CardContent className="flex flex-row flex-wrap gap-5">
        {isLoading && Array.from({ length: 10 }).map((_,idx) => <AnimeCardSkeleton key={idx} />)}
        {history && history.map((h, idx) => (
          <AnimeHistoryCard 
            key={idx}
            id={Number(h.mediaId)}
            coverImage={h.mediaCoverImage}
            title={h.mediaTitle}
            episodeNumber={h.mediaEpisode}
            percentage={getPercentage({ duration: h.duration, progress: h.progress })}
          />
        ))}
        {(!isLoading && !history?.length) && <>No entries found.</>}
      </CardContent>
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