import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Calendar } from 'lucide-react'

export default function ActivityHistorySkeleton() {
  // Generate skeleton blocks for calendar grid (52 weeks * 7 days = ~364 blocks)
  const calendarBlocks = Array.from({ length: 364 }, (_, i) => i)
  
  return (
    <Card className='w-fit bg-secondary'>
      {/* Header Skeleton */}
      <CardHeader>
        <div className="flex flex-row gap-2 items-center">
          <Calendar size={20} className="text-muted-foreground" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-4 w-80" />
      </CardHeader>
      
      <Separator className='border-1' />
      
      {/* Stats Skeleton */}
      <div className='px-6 w-fit'>
        <div className='flex flex-col justify-center items-center gap-0 py-4'>
          <Skeleton className="h-7 w-12 mb-1" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      
      <Separator />
      
      <CardContent className="pt-6">
        {/* Calendar Grid Skeleton */}
        <div className="space-y-4">
          {/* Month labels skeleton */}
          <div className="flex justify-between text-xs">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
              <Skeleton key={i} className="h-3 w-6" />
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="flex gap-1">
            {/* Weekday labels */}
            <div className="flex flex-col gap-1 text-xs mr-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <div key={i} className="h-3 w-6 flex items-center justify-center">
                  {i % 2 === 0 && <Skeleton className="h-3 w-6" />}
                </div>
              ))}
            </div>
            
            {/* Calendar blocks grid */}
            <div className="grid grid-flow-col grid-rows-7 gap-1">
              {calendarBlocks.map((_, index) => (
                <Skeleton 
                  key={index} 
                  className="h-3 w-3 rounded-sm"
                  style={{
                    animationDelay: `${(index % 30) * 25}ms`
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Legend skeleton */}
          <div className="flex items-center justify-between text-xs">
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-8" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-3 rounded-sm" />
                ))}
              </div>
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}