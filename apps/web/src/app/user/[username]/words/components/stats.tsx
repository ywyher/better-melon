import StatsCard, { StatsCardSkeleton } from '@/components/stats-card'
import { useMemo } from 'react'
import { Separator } from '@/components/ui/separator'
import { Word } from '@/lib/db/schema'
import { Hash, Hourglass, EyeOff, HelpCircle, TvMinimalPlay } from 'lucide-react'

export default function ProfileWordsStats({ words, isLoading }: { words: Word[], isLoading: boolean }) {
  const { totalWords, totalKnown, totalLearning, totalIgnore, totalUnknown } = useMemo(() => {
    return {
      totalWords: words.length,
      totalKnown: words.filter(w => w.status === 'known').length,
      totalLearning: words.filter(w => w.status === 'learning').length,
      totalIgnore: words.filter(w => w.status === 'ignore').length,
      totalUnknown: words.filter(w => w.status === 'unknown').length,
    }
  }, [words])

  return (
    <>
      <Separator />
      <div className="flex flex-row justify-center items-center gap-10">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ): (
          <>
            <StatsCard value={totalWords} icon={Hash} label="Total words" />
            <StatsCard value={totalKnown} icon={Hourglass} label="Known" />
            <StatsCard value={totalLearning} icon={TvMinimalPlay} label="Learning" />
            <StatsCard value={totalIgnore} icon={EyeOff} label="Ignored" />
            <StatsCard value={totalUnknown} icon={HelpCircle} label="Unknown" />
          </>
        )}
      </div>
      <Separator />
    </>
  )
}