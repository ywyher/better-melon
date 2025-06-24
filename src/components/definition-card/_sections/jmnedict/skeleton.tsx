import { Skeleton } from "@/components/ui/skeleton";
import { Minus } from "lucide-react";

export function JMnedictSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-row gap-1 items-center flex-wrap">
        <h1 className="text-xl">Names</h1>
        <span className="text-gray-500 text-lg"><Minus /></span>
        <Skeleton className="h-6 w-16" />
      </div>

      {/* Entry skeleton */}
      {[1].map((entry) => (
        <div key={entry} className="flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-3">
            {/* Name display */}
            <div className="flex flex-row flex-wrap items-center gap-3">
              <Skeleton className="h-8 w-24" /> {/* Name */}
              <div className="flex flex-col gap-3">
                <Skeleton className="h-6 w-20" /> {/* Add to anki badge */}
              </div>
            </div>
            
            {/* Translations */}
            <div className="flex flex-row gap-1 flex-wrap">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-2" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-2" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}