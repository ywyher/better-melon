'use client'

import WordCard from "@/app/user/[username]/words/components/word-card";
import ProfileWordsFilters from "@/app/user/[username]/words/components/filters/filters";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import { WordFilters } from "@/types/word";
import { profileQueries } from "@/lib/queries/profile";
import { useMemo, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileWordsPagination from "@/app/user/[username]/words/components/pagination";

export default function ProfileWords() {
  const params = useParams()
  const username = String(params.username)
  const [filters, setFilters] = useState<WordFilters>({
    page: 1,
    limit: 2,
  })
  
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

  return (
    <Card className="w-full bg-secondary">
      <CardHeader className="flex flex-col gap-3 lg:gap-0 lg:flex-row justify-between">
        <CardTitle className="text-2xl flex-1">Words</CardTitle>
        <ProfileWordsFilters setFilters={setFilters} />
      </CardHeader>
      <Separator />
      <CardContent className="p-6">
        {isLoading && <>Loading</>}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {words && words.map((w, idx) => (
            <WordCard 
              key={idx}
              word={w}
            />
          ))}
        </div>
      </CardContent>
      {pagination && (
        <CardFooter>
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