import DialogWrapper from '@/components/dialog-wrapper'
import AnimeHistoryCard from '@/components/anime/card/history/card'
import ListScrollAreaWrapper from '@/components/home/wrappers/scroll-area'
import { format } from 'date-fns'
import { History } from '@/lib/db/schema'
import { getPercentage } from '@/lib/utils/utils'

type ActivityDetailsDialogProps = {
  dateKey: string
  animes: History[] | undefined
  onClose: () => void
}

export default function ActivityDetailsDialog({ 
  dateKey, 
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
      className="min-w-xl"
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