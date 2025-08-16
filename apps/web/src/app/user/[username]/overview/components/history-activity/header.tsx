import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

export default function HistoryActivityHeader() {
  return (
    <CardHeader>
      <CardTitle className="flex flex-row gap-2 items-center">
        <Calendar size={20} />
        History Activity
      </CardTitle>
      <CardDescription>
        Anime episodes watched per day (click squares for details)
      </CardDescription>
    </CardHeader>
  )
}