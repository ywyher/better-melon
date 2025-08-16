import StatsCard from '@/components/stats-card'
import { History } from '@/lib/db/schema'
import { useMemo } from 'react'
import { Separator } from '@/components/ui/separator'
import { Hash, Hourglass, TvMinimalPlay } from 'lucide-react'
import { calculateTotalAnimes, calculateTotalEpisodes, calculateTotalHours } from '@/lib/utils/history'

type ActivityHistoryStatsProps = {
  animes: History[]
}

export default function ActivityHistoryStats({ animes }: ActivityHistoryStatsProps) {
  const { totalHours, totalAnimes, totalEpisodes } = useMemo(() => {
    if(!animes) return {
      totalHours: 0,
      totalAnimes: 0,
      totalEpisodes: 0,
    }
    return {
      totalHours: calculateTotalHours(animes),
      totalAnimes: calculateTotalAnimes(animes),
      totalEpisodes: calculateTotalEpisodes(animes)
    }
  }, [animes])

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