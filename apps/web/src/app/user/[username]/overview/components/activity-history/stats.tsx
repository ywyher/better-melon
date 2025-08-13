import StatsCard from '@/components/stats-card'
import { History } from '@/lib/db/schema'
import { useMemo } from 'react'
import { Separator } from '@/components/ui/separator'
import { Hash, Hourglass, TvMinimalPlay } from 'lucide-react'
import { calculateTotalAnimes, calculateTotalEpisodes, calculateTotalHours } from '@/lib/utils/history'

type ActivityHistoryStatsProps = {
  medias: History[]
}

export default function ActivityHistoryStats({ medias }: ActivityHistoryStatsProps) {
  const { totalHours, totalAnimes, totalEpisodes } = useMemo(() => {
    if(!medias) return {
      totalHours: 0,
      totalAnimes: 0,
      totalEpisodes: 0,
    }
    return {
      totalHours: calculateTotalHours(medias),
      totalAnimes: calculateTotalAnimes(medias),
      totalEpisodes: calculateTotalEpisodes(medias)
    }
  }, [medias])

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