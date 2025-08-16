import HistoryActivityStats from '@/app/user/[username]/overview/components/history-activity/stats'
import HistoryActivityHeader from '@/app/user/[username]/overview/components/history-activity/header'
import ActivityCalendarWrapper from '@/components/activity-calendar-wrapper'
import { useQuery } from '@tanstack/react-query'
import { profileQueries } from '@/lib/queries/profile'
import { Card, CardContent } from '@/components/ui/card'
import { useCallback, useMemo, useState } from 'react'
import HistoryActivityDetailsDialog from '@/app/user/[username]/overview/components/history-activity/details-dialog'

type HistoryActivityProps = {
  username: string
}

export default function HistoryActivity({ username }: HistoryActivityProps) {
  const [dateKey, setDateKey] = useState<string>('')
  
  const { data, isLoading } = useQuery({
    ...profileQueries.historyActivity({ username })
  })

  const entries = useMemo(() => {
    if (!data) return []
    return data.entries
  }, [data])

  const grouped = useMemo(() => {
    if (!data) return {}
    return data.grouped
  }, [data])

  const animes = useMemo(() => {
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
      <HistoryActivityHeader />
      
      <HistoryActivityStats 
        animes={entries.flatMap(entry => entry.animes || [])} 
        isLoading={isLoading}
      />
      
      <CardContent>
        <ActivityCalendarWrapper
          entries={entries}
          isLoading={isLoading}
          onDateClick={handleDateClick}
          className="flex justify-center items-center"
        />
        
        <HistoryActivityDetailsDialog
          dateKey={dateKey}
          username={username}
          animes={animes}
          onClose={handleDialogClose}
        />
      </CardContent>
    </Card>
  )
}