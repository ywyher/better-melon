import { Skeleton } from "@/components/ui/skeleton";
import { Minus } from "lucide-react";

export function Kanjidic2Skeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-row gap-1 items-center flex-wrap">
        <h1 className="text-xl">Kanji</h1>
        <span className="text-gray-500 text-lg"><Minus /></span>
        <Skeleton className="h-6 w-16" />
      </div>

      {/* Entry skeleton */}
      {[1].map((entry) => (
        <div key={entry} className="flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-4">
            {/* Misc info */}
            <div className="inline-flex flex-row flex-wrap gap-2">
              <Skeleton className="h-5 w-40" /> {/* Stroke count, JLPT, grade info */}
            </div>
            
            <div className="grid grid-cols-12 gap-4">
              {/* Literal section */}
              <div className="col-span-2">
                <div className="flex flex-col gap-2 items-center">
                  <Skeleton className="h-16 w-16" /> {/* Large kanji character */}
                  <Skeleton className="h-6 w-20" /> {/* Add to anki badge */}
                </div>
              </div>
              
              {/* Meanings and readings */}
              <div className="col-span-10 flex flex-col gap-5">
                {/* Meanings */}
                <div className="flex flex-row gap-1 flex-wrap">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-2" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-2" />
                  <Skeleton className="h-6 w-24" />
                </div>
                
                {/* Readings */}
                <div className="space-y-2">
                  {['On', 'Kun'].map((type) => (
                    <div key={type} className="flex flex-row gap-2 items-baseline">
                      <Skeleton className="h-5 w-8" /> {/* Reading type */}
                      <div className="flex flex-wrap items-center gap-1">
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-4 w-2" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-4 w-2" />
                        <Skeleton className="h-5 w-10" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}