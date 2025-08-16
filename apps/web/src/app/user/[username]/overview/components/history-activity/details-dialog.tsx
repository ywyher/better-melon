import DialogWrapper from '@/components/dialog-wrapper'
import AnimeHistoryCard from '@/components/anime/card/history/card'
import ListScrollAreaWrapper from '@/components/home/wrappers/scroll-area'
import { format } from 'date-fns'
import { History } from '@/lib/db/schema'
import { getPercentage } from '@/lib/utils/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type ActivityDetailsDialogProps = {
  dateKey: string
  username: string
  animes: History[] | undefined
  onClose: () => void
}

export default function HistoryActivityDetailsDialog({ 
  dateKey,
  username,
  animes, 
  onClose 
}: ActivityDetailsDialogProps) {
  const isOpen = Boolean(animes)
  
  return (
    <DialogWrapper
      open={isOpen}
      setOpen={onClose}
      title={<>Activity Details - {dateKey && format(new Date(dateKey), "MMM dd, yyyy")}</>}
      description={<>{animes?.length || 0} animes watched in this day</>}
      footer={
        <Button
          asChild
          variant="outline"
          className='w-full'
        >
          <Link href={`/user/${username}/history?date={"from":"${dateKey}","to":"${dateKey}"}`}>
            Details
          </Link>
        </Button>
      }
      className="min-w-xl bg-secondary"
      headerClassName='bg-secondary'
    >
      <ListScrollAreaWrapper showMore={false}>
        {animes && animes.map((anime) => (
          <AnimeHistoryCard
            key={anime.id}
            id={Number(anime.id)}
            coverImage={anime.animeCoverImage}
            title={anime.animeTitle}
            episodeNumber={Number(anime.animeEpisode)}
            percentage={getPercentage({ 
              progress: anime.progress, 
              duration: anime.duration 
            })}
          />
        ))}
      </ListScrollAreaWrapper>
    </DialogWrapper>
  )
}