import WordCard from '@/components/word-card'
import DialogWrapper from '@/components/dialog-wrapper'
import { Word } from '@/lib/db/schema'
import { format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type ActivityDetailsDialogProps = {
  dateKey: string
  username: string
  words: Word[] | undefined
  onClose: () => void
}

export default function WordsActivityDetailsDialog({ 
  dateKey,
  username,
  words, 
  onClose 
}: ActivityDetailsDialogProps) {
  const isOpen = Boolean(words)
  
  return (
    <DialogWrapper
      open={isOpen}
      setOpen={onClose}
      title={<>Activity Details - {dateKey && format(new Date(dateKey), "MMM dd, yyyy")}</>}
      description={<>{words?.length || 0} words mined on this day</>}
      footer={
        <Button
          asChild
          variant="outline"
          className='w-full'
        >
          <Link href={`/user/${username}/words?date={"from":"${dateKey}","to":"${dateKey}"}`}>
            Details
          </Link>
        </Button>
      }
      className="min-w-xl bg-secondary"
      headerClassName='bg-secondary'
    >
      <ScrollArea className='
        overflow-y-scroll max-h-100
      '>
        <div className='flex flex-col gap-3'>
          {words && words.map((word) => (
            <WordCard
              key={word.id}
              word={word}
            />
          ))}
        </div>
      </ScrollArea>
    </DialogWrapper>
  )
}