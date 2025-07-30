import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"


export default function PlayerSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      {/* AutoPlaybackSettings skeleton */}
      <div>
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-5 w-3/4 mb-6" />
        
        <div className="flex flex-col gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="space-y-1">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-56" />
              </div>
              <Skeleton className="h-6 w-10 mt-2 md:mt-0" />
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      {/* EnabledTranscriptionsSettings skeleton */}
      <div className="flex flex-col gap-5">
        <div className="flex justify-between md:grid grid-cols-2">
          <div className="col-span-1 space-y-1">
            <Skeleton className="h-5 w-48 mb-1" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
