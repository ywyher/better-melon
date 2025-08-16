import ProfileHistoryDateFilter from "@/app/user/[username]/history/components/filters/date";
import ProfileHistoryAnimeTitleFilters from "@/app/user/[username]/history/components/filters/anime-title";
import { HistoryFilters } from "@/types/history";
import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { parseAsInteger, parseAsJson, useQueryState } from "nuqs";
import { dateRangeSchema } from "@/types";
import { Button } from "@/components/ui/button";
import { Delete, Save } from "lucide-react";

export default function ProfileHistoryFilters({ setFilters }: { setFilters:  Dispatch<SetStateAction<HistoryFilters>> }) { 
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const [animeTitle, setAnimeTitle] = useQueryState('animeTitle')
  const [date, setDate] = useQueryState('date', parseAsJson(dateRangeSchema.parse))

  const applyFilters = useCallback(() => {
    setPage(1)
    setDate(date)
    setAnimeTitle(animeTitle)
    setFilters({
      page: page ?? 1,
      animeTitle: animeTitle ?? undefined,
      date: date ?? undefined,
      limit: 20
    })
  }, [page, date, animeTitle])
  
  const resetFilters = useCallback(() => {
    setPage(1)
    setDate(null)
    setAnimeTitle(null)
    setFilters({
      page: page ?? 1,
      limit: 20
    })
  }, [page])

  useEffect(() => {
    applyFilters()
  }, [])

  return (
    <div className="flex flex-row gap-3 flex-1">
      <div className="flex flex-row gap-3 flex-1">
        <ProfileHistoryAnimeTitleFilters />
        <ProfileHistoryDateFilter />
      </div>
      <div className="flex flex-row gap-3">
        <Button
          className="flex-1"
          onClick={applyFilters}
        >
          <Save />
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={resetFilters}
        >
          <Delete />
        </Button>
      </div>
    </div>
  )
}