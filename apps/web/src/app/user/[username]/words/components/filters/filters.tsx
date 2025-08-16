import ProfileWordsAnimeTitleFilter from "@/app/user/[username]/words/components/filters/anime-title"
import ProfileWordsEpisodeNumberFilter from "@/app/user/[username]/words/components/filters/episode-number"
import ProfileWordsStatusFilter from "@/app/user/[username]/words/components/filters/status"
import ProfileWordsWordFilter from "@/app/user/[username]/words/components/filters/word"
import { Button } from "@/components/ui/button"
import { Word } from "@/lib/db/schema"
import { WordFilters } from "@/types/word"
import { wordStatuses } from "@/lib/constants/word"
import { Dispatch, SetStateAction, useCallback, useEffect } from "react"
import { parseAsInteger, parseAsJson, parseAsStringEnum, useQueryState } from "nuqs"
import { dateRangeSchema } from "@/types"
import ProfileWordsDateFilter from "@/app/user/[username]/words/components/filters/date"
import { Delete, Save } from "lucide-react"

export default function ProfileWordsFilters({ setFilters }: { setFilters:  Dispatch<SetStateAction<WordFilters>> }) { 
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const [status, setStatus] = useQueryState('status',
    parseAsStringEnum<Word['status']>(wordStatuses)
  )
  const [date, setDate] = useQueryState('date', parseAsJson(dateRangeSchema.parse))
  const [word, setWord] = useQueryState('word')
  const [episodeNumber, setEpisodeNumber] = useQueryState('episodeNumber', parseAsInteger)
  const [animeTitle, setAnimeTitle] = useQueryState('animeTitle')

  const applyFilters = useCallback(() => {
    setPage(1)
    setStatus(status)
    setWord(word)
    setEpisodeNumber(episodeNumber)
    setDate(date)
    setAnimeTitle(animeTitle)
    setFilters({
      page: page ?? 1,
      status: status ?? undefined,
      word: word ?? undefined,
      episodeNumber: episodeNumber ?? undefined,
      animeTitle: animeTitle ?? undefined,
      date: date ?? undefined,
      limit: 20
    })
  }, [page, status, word, episodeNumber, animeTitle, date])
  
  const resetFilters = useCallback(() => {
    setPage(1)
    setStatus(null)
    setWord(null)
    setEpisodeNumber(null)
    setAnimeTitle(null)
    setDate(null)
    setFilters({
      page: page ?? 1,
      limit: 20
    })
  }, [page])

  useEffect(() => {
    applyFilters()
  }, [])

  return (
    <div className="
      flex flex-col lg:flex-row gap-3 flex-3
    ">
      <div className="flex flex-col lg:flex-row gap-2 flex-1">
        <ProfileWordsWordFilter />
        <ProfileWordsAnimeTitleFilter />
        <ProfileWordsEpisodeNumberFilter />
        <ProfileWordsStatusFilter />
        <ProfileWordsDateFilter />
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