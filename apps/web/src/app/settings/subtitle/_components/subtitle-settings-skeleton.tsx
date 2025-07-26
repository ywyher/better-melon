import { Skeleton } from "@/components/ui/skeleton"

export default function SubtitleSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {/* Title skeleton */}
      <Skeleton className="h-7 w-48" />
      
      {/* Preferred Format Section */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-8 items-center gap-4">
          <div className="col-span-4">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="col-span-4 flex flex-row gap-3">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
      
      {/* Match Pattern Section */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-8 items-center gap-4">
          <div className="col-span-4 flex flex-row gap-1">
            <Skeleton className="h-5 w-full" />
          </div>
          <div className="col-span-4 flex flex-row gap-3">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}