import { Separator } from '@/components/ui/separator'
import { ActivityHistoryEntry } from '@/types/history'
import { useMemo } from 'react'

type ActivityHistoryStatsProps = {
  entries: ActivityHistoryEntry[]
}

export default function ActivityHistoryStats({ entries }: ActivityHistoryStatsProps) {
  const totalHours = useMemo(() => {
    const totalSeconds = entries.reduce((sum, entry) => {
      // Handle case where medias might be undefined
      if (!entry.medias || !Array.isArray(entry.medias)) {
        return sum
      }
      
      // Sum all durations from the medias array
      const entryTotalSeconds = entry.medias.reduce((mediaSum, media) => {
        const duration = media.duration || 0
        return mediaSum + duration
      }, 0)
      
      return sum + entryTotalSeconds
    }, 0)
    
    // Convert seconds to hours and round to 1 decimal place
    return Math.round((totalSeconds / 3600) * 10) / 10
  }, [entries])

  return (
    <>
      <Separator className='border-1' />
      <div className='flex flex-row gap-5 justify-center'>
        <div className='px-6 w-fit'>
          <div className='flex flex-col justify-center items-center gap-0'>
            <div className="text-xl font-bold">{entries.length}</div>
            <div className="text-muted-foreground text-md">Total watched</div>
          </div>
        </div>
        <div className='px-6 w-fit'>
          <div className='flex flex-col justify-center items-center gap-0'>
            <div className="text-xl font-bold">{totalHours}h</div>
            <div className="text-muted-foreground text-md">Total hours watched</div>
          </div>
        </div>
      </div>
      <Separator />
    </>
  )
}