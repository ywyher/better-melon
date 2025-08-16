import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

export default function WordsActivityHeader() {
  return (
    <CardHeader>
      <CardTitle className="flex flex-row gap-2 items-center">
        <Calendar size={20} />
        Words Activity
      </CardTitle>
      <CardDescription>
        Words mined per day (click squares for details)
      </CardDescription>
    </CardHeader>
  )
}