import ActivityHistoryStats from '@/app/user/[username]/overview/components/activity-history/stats'
import ActivityHistoryHeader from '@/app/user/[username]/overview/components/activity-history/header'
import ActivityDetailsDialog from '@/app/user/[username]/overview/components/activity-history/details-dialog'
import ActivityHistorySkeleton from '@/app/user/[username]/overview/components/activity-history/skeleton'
import ActivityCalendarWrapper from '@/components/activity-calendar-wrapper'
import { useQuery } from '@tanstack/react-query'
import { profileQueries } from '@/lib/queries/profile'
import { Card, CardContent } from '@/components/ui/card'
import { useCallback, useEffect, useMemo, useState } from 'react'

type ActivityHistoryProps = {
  username: string
}

export default function ActivityHistory({ username }: ActivityHistoryProps) {
  const [dateKey, setDateKey] = useState<string>('')
  
  const { data, isLoading } = useQuery({
    ...profileQueries.activiyHistory({ username })
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

  if(isLoading) return <ActivityHistorySkeleton />  

  return (
    <Card className='w-fit bg-secondary'>
      <ActivityHistoryHeader />
      
      
      <ActivityHistoryStats animes={entries.flatMap(entry => entry.animes || [])} />
      
      <CardContent>
        <ActivityCalendarWrapper
          entries={entries}
          isLoading={isLoading}
          onDateClick={handleDateClick}
        />
        
        <ActivityDetailsDialog
          dateKey={dateKey}
          animes={animes}
          onClose={handleDialogClose}
        />
      </CardContent>
    </Card>
  )
}