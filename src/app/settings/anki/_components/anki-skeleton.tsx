import { Skeleton } from "@/components/ui/skeleton"
import { CardContent } from "@/components/ui/card"

export default function AnkiPresetFormSkeleton() {
  return (
    <CardContent className="flex flex-col gap-4 py-3 px-6">
      <div className="flex flex-col space-y-6">
        {/* Form fields */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-8 gap-4 items-center">
              <Skeleton className="h-4 w-20 col-span-3" />
              <Skeleton className="h-10 col-span-5" />
            </div>
          ))}
        </div>
        
        {/* Field mappings skeleton */}
        <div className="bg-muted/20 rounded-lg p-4 border border-border">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="grid grid-cols-8 gap-4 mb-2 border-b pb-2">
            <Skeleton className="h-4 w-20 col-span-3" />
            <Skeleton className="h-4 w-16 col-span-5" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-8 gap-4 items-center">
                <Skeleton className="h-4 w-16 col-span-3" />
                <div className="col-span-5 flex items-center gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Switch fields */}
        <div className="space-y-3 pt-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-11" />
              </div>
            </div>
          ))}
        </div>

        {/* Submit button */}
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
  )
}