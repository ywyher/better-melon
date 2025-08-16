import WordsActivityStats from '@/app/user/[username]/overview/components/words-activity/stats'
import WordsActivityHeader from '@/app/user/[username]/overview/components/words-activity/header'
import ActivityCalendarWrapper from '@/components/activity-calendar-wrapper'
import WordsActivityDetailsDialog from '@/app/user/[username]/overview/components/words-activity/details-dialog'
import { useQuery } from '@tanstack/react-query'
import { profileQueries } from '@/lib/queries/profile'
import { Card, CardContent } from '@/components/ui/card'
import { useCallback, useMemo, useState } from 'react'

type WordsActivityProps = {
  username: string
}

export default function WordsActivity({ username }: WordsActivityProps) {
  const [dateKey, setDateKey] = useState<string>('')
  
  const { data, isLoading } = useQuery({
    ...profileQueries.wordsActivity({ username })
  })

  const entries = useMemo(() => {
    if (!data) return []
    return data.entries
  }, [data])

  const grouped = useMemo(() => {
    if (!data) return {}
    return data.grouped
  }, [data])

  const words = useMemo(() => {
    if (!dateKey || !grouped) return
    return grouped[dateKey]
  }, [dateKey, grouped])

  const handleDateClick = useCallback((newDateKey: string) => {
    setDateKey(newDateKey)
  }, [])

  const handleDialogClose = useCallback(() => {
    setDateKey('')
  }, [])

  return (
    <Card className='w-full bg-secondary'>
      <WordsActivityHeader />
      
      <WordsActivityStats 
        words={entries.flatMap(entry => entry.words || [])} 
        isLoading={isLoading}
      />
      
      <CardContent>
        <ActivityCalendarWrapper
          entries={entries}
          isLoading={isLoading}
          onDateClick={handleDateClick}
          className="flex justify-center items-center"
        />
        
        <WordsActivityDetailsDialog
          dateKey={dateKey}
          username={username}
          words={words}
          onClose={handleDialogClose}
        />
      </CardContent>
    </Card>
  )
}