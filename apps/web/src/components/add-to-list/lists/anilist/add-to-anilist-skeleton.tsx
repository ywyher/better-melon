import { Skeleton } from "@/components/ui/skeleton";

export function AddToAnilistSkeleton() {
  return (
    <div className="flex flex-col gap-5 w-full animate-in fade-in-50">
      {/* First row of form fields */}
      <div className="flex flex-row justify-between gap-5">
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="h-5 w-16" /> {/* Label skeleton */}
          <Skeleton className="h-10 w-full" /> {/* Status select skeleton */}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="h-5 w-12" /> {/* Label skeleton */}
          <Skeleton className="h-10 w-full" /> {/* Score input skeleton */}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="h-5 w-32" /> {/* Label skeleton */}
          <Skeleton className="h-10 w-full" /> {/* Episode progress input skeleton */}
        </div>
      </div>

      {/* Second row of form fields */}
      <div className="flex flex-row justify-between gap-5">
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="h-5 w-20" /> {/* Label skeleton */}
          <Skeleton className="h-10 w-full" /> {/* Start date input skeleton */}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="h-5 w-24" /> {/* Label skeleton */}
          <Skeleton className="h-10 w-full" /> {/* Finished at input skeleton */}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="h-5 w-32" /> {/* Label skeleton */}
          <Skeleton className="h-10 w-full" /> {/* Total rewatches input skeleton */}
        </div>
      </div>

      {/* Notes field */}
      <div className="flex flex-col gap-2 w-full">
        <Skeleton className="h-5 w-12" /> {/* Label skeleton */}
        <Skeleton className="h-24 w-full" /> {/* Notes textarea skeleton */}
      </div>

      {/* Button */}
      <Skeleton className="h-10 w-full mt-2" /> {/* Button skeleton */}
    </div>
  );
}