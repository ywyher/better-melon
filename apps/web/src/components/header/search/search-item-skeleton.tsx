import { Skeleton } from "@/components/ui/skeleton"

export default function SearchItemSkeleton() {
  return (
    <div className="flex flex-row gap-3 w-full">
      <div>
        <Skeleton className="w-[70px] h-[80px] rounded-md" />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  )
}