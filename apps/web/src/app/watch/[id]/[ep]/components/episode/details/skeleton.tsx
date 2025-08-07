import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function StreamingDetailsSkeleton() {
  return (
    <Card className="flex flex-col gap-2 bg-secondary">
      {/* Header skeleton */}
      <CardHeader className="flex flex-row justify-between">
        <div className="flex-1">
          {/* Episode title skeleton */}
          <Skeleton className="h-7 w-100 mb-1" />
        </div>
        <div className="flex flex-row gap-2">
          {/* Date badge skeleton */}
          <Skeleton className="h-9 w-20" />
          {/* History button skeleton */}
          <Skeleton className="h-9 w-36" />
          {/* Add to list button skeleton */}
          <Skeleton className="h-9 w-24" />
        </div>
      </CardHeader>
      
      {/* Content skeleton */}
      <CardContent>
        <div className="bg-accent p-2 rounded-sm border-primary/20 border-1">
          {/* Description skeleton - multiple lines */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}