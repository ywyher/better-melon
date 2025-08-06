import { Skeleton } from "@/components/ui/skeleton";

export function AddToAnilistSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-5">
        {/* First row: Status, Score, Episode Progress */}
        <div className="flex flex-row justify-between gap-5">
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-12" /> {/* Status label */}
            <Skeleton className="h-10 w-full" /> {/* Status select */}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-10" /> {/* Score label */}
            <Skeleton className="h-10 w-full" /> {/* Score input */}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-28" /> {/* Episode Progress label */}
            <Skeleton className="h-10 w-full" /> {/* Episode Progress input */}
          </div>
        </div>

        {/* Second row: Start Date, Finished At, Total Rewatches */}
        <div className="flex flex-row justify-between gap-5">
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-20" /> {/* Start Date label */}
            <Skeleton className="h-10 w-full" /> {/* Start Date calendar */}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-20" /> {/* Finished At label */}
            <Skeleton className="h-10 w-full" /> {/* Finished At calendar */}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-24" /> {/* Total Rewatches label */}
            <Skeleton className="h-10 w-full" /> {/* Total Rewatches input */}
          </div>
        </div>

        {/* Notes field */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-12" /> {/* Notes label */}
          <Skeleton className="h-20 w-full" /> {/* Notes textarea */}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-row gap-2 justify-end">
        <Skeleton className="h-10 w-16" /> {/* Delete button */}
        <Skeleton className="h-10 w-24" /> {/* Add/Update button */}
      </div>
    </div>
  );
}