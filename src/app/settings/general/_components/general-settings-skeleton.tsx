"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function GeneralSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-4 sm:px-0">
      <Skeleton className="h-7 w-48" /> {/* Title skeleton */}
      
      <div className="flex flex-col md:grid grid-cols-2 md:items-center justify-between gap-2 pb-4">
        <div className="col-span-1 space-y-1">
          <Skeleton className="h-5 w-40 mb-2" /> {/* Setting title skeleton */}
          <Skeleton className="h-4 w-full max-w-md" /> {/* Description line 1 */}
          <Skeleton className="h-4 w-3/4 max-w-sm" /> {/* Description line 2 */}
        </div>
        <div className="col-span-1 flex justify-end">
          <Skeleton className="h-10 w-48" /> {/* Toggle control skeleton */}
        </div>
      </div>
    </div>
  )
}

export default GeneralSettingsSkeleton