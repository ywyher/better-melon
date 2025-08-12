import StatsCard from '@/components/stats-card'
import { Separator } from '@/components/ui/separator'
import { ActivityHistoryEntry } from '@/types/history'
import { Hash, Hourglass, TvMinimalPlay } from 'lucide-react'
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

  const totalEpisodes = useMemo(() => {
    return entries.reduce((sum, entry) => {
      // Handle case where medias might be undefined
      if (!entry.medias || !Array.isArray(entry.medias)) {
        return sum
      }
      
      // Add the number of media objects (episodes) in this entry
      return sum + entry.medias.length
    }, 0)
  }, [entries])

  const totalAnimes = useMemo(() => {
    const uniqueAnimeIds = new Set<string>()
    
    entries.forEach(entry => {
      // Handle case where medias might be undefined
      if (!entry.medias || !Array.isArray(entry.medias)) {
        return
      }
      
      // Add all animeIds to the Set (automatically handles uniqueness)
      entry.medias.forEach(media => {
        if (media.mediaId) {
          uniqueAnimeIds.add(media.mediaId)
        }
      })
    })
    
    return uniqueAnimeIds.size
  }, [entries])

  return (
    <>
      <Separator className='border-1' />
      <div className='flex flex-row justify-center items-center gap-10'>
        <StatsCard 
          value={totalAnimes}
          icon={Hash}
          label='Total animes'
        />
        <StatsCard 
          value={totalEpisodes}
          icon={TvMinimalPlay}
          label='Total episodes'
        />
        <StatsCard 
          value={`${totalHours}h`}
          icon={Hourglass}
          label='Total hours wasted'
        />
      </div>
      <Separator />
    </>
  )
}