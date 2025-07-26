import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Minus } from "lucide-react"

export function JMdictSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-row gap-1 items-center flex-wrap">
        <h1 className="text-xl">Dictionary</h1>
        <span className="text-gray-500 text-lg"><Minus /></span>
        <Skeleton className="h-6 w-16" />
      </div>

      {/* Entry skeleton - showing 2 entries */}
      {[1, 2].map((entry) => (
        <div key={entry} className="flex flex-col justify-between gap-5">
          <div className="px-3">
            {/* Main character display */}
            <div className="mb-4">
              <div className="flex flex-col gap-4">
                <Skeleton className="h-8 w-20" /> {/* Main character */}
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-6 w-24" /> {/* Common badge */}
                  <Skeleton className="h-6 w-20" /> {/* Add to anki badge */}
                </div>
              </div>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-12 gap-6">
              {/* Forms section */}
              <div className="col-span-12 md:col-span-4 lg:col-span-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" /> {/* "Other forms" title */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-2" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-2" />
                    <Skeleton className="h-4 w-14" />
                  </div>
                </div>
              </div>
              
              {/* Meanings section */}
              <div className="col-span-12 md:col-span-8 lg:col-span-9">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-16" /> {/* "Meanings" title */}
                  <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((sense) => (
                      <div key={sense} className="flex flex-row gap-3">
                        <Skeleton className="h-5 w-4" /> {/* Number */}
                        <div className="flex flex-row flex-wrap gap-2">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-4 w-2" />
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-2" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {entry < 2 && <Separator />}
        </div>
      ))}
    </div>
  )
}