import DialogWrapper from '@/components/dialog-wrapper'
import AnimeHistoryCard from '@/components/anime/card/history/card'
import ListScrollAreaWrapper from '@/components/home/wrappers/scroll-area'
import { useQuery } from '@tanstack/react-query'
import { profileQueries } from '@/lib/queries/profile'
import { ActivityCalendar } from 'react-activity-calendar'
import { format } from 'date-fns'
import { getPercentage } from '@/lib/utils/utils'
import { cloneElement, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

type ActivityHistoryProps = {
  username: string
}

export default function ActivityHistory({ username }: ActivityHistoryProps) {
  const [dateKey, setDateKey] = useState<string>('')
  
  const { data, isLoading } = useQuery({
    ...profileQueries.activiyHistory({ username })
  })

  const entries = useMemo(() => {
    if(!data) return []
    return data.entries
  }, [data])

  const grouped = useMemo(() => {
    if(!data) return {}
    return data.grouped
  }, [data])

  const animes = useMemo(() => {
    if(!dateKey ||! grouped) return;
    return grouped[dateKey]
  }, [dateKey, grouped])

  return (
    <Card className='w-fit'>
      <CardHeader>
        <CardTitle className="flex flex-row gap-2 items-center">
          <Calendar size={20} />
          Activity History
        </CardTitle>
        <CardDescription>Anime episodes watched per day (click squares for details)</CardDescription>
      </CardHeader>
      <Separator />
      <div className='px-6 w-fit'>
        <div className='flex flex-col justify-center items-center gap-0'>
          <div className="text-xl font-bold">{entries.length}</div>
          <div className="text-muted-foreground text-md">Total watched</div>
        </div>
      </div>
      <Separator />
      <CardContent>
        <ActivityCalendar 
          data={entries || []}
          loading={isLoading}
          hideColorLegend={false}
          hideTotalCount={false}
          showWeekdayLabels={true}
          renderBlock={(block, { count, date }) =>
            cloneElement(block, {
              'data-tooltip-id': 'react-tooltip',
              'data-tooltip-html': `${count} activities on ${date}`,
              onClick: () => setDateKey(format(new Date(date), 'yyyy-MM-dd'))
            })
          }
        />
        <ReactTooltip id="react-tooltip" />
        <DialogWrapper
          open={animes ? true : false}
          setOpen={() => setDateKey(dateKey ? '' : dateKey)}
          title={<>Activity Details - {dateKey && format(new Date(dateKey), "MMM dd, yyyy")}</>}
          description={<>{animes?.length || 0} animes watched in this day</>}
          className="min-w-xl"
        >
          <ListScrollAreaWrapper
            showMore={false}
          >
            {animes && animes.map((anime) => (
              <AnimeHistoryCard
                key={anime.id}
                id={Number(anime.id)}
                coverImage={anime.mediaCoverImage}
                title={anime.mediaTitle}
                episodeNumber={Number(anime.mediaEpisode)}
                percentage={getPercentage({ progress: anime.progress, duration: anime.duration })}
              />
            ))}
          </ListScrollAreaWrapper>
        </DialogWrapper>
      </CardContent>
    </Card>
  )
}