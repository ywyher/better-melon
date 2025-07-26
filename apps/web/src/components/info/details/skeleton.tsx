import EpisodesListSkeleton from "@/components/episodes-list/skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/utils";

type DetailsSkeletonProps = {
  className?: string;
}

export default function DetailsSkeleton({ className }: DetailsSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-5 pb-10", className)}>
      {/* Header skeleton */}
      <DetailsHeaderSkeleton />
      
      <div className="flex flex-col xl:flex-row justify-between gap-5">
        {/* Left side - Tabs skeleton */}
        <div className="flex-1 h-[80vh]">
          <DetailsTabsSkeleton />
        </div>
        
        {/* Right side - Episodes list skeleton */}
        <div className="min-w-[500px] max-w-full xl:max-w-[500px] h-[80vh]">
          <EpisodesListSkeleton />
        </div>
      </div>
    </div>
  );
}

// Header skeleton
function DetailsHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      <Skeleton className="h-8 w-24" /> {/* "Details" title */}
      <Skeleton className="h-5 w-64" /> {/* Description text */}
    </div>
  );
}

// Tabs skeleton
function DetailsTabsSkeleton() {
  return (
    <Tabs value="overview" className="w-full h-full flex flex-col">
      <TabsList className="
        w-full px-0 py-6
        bg-secondary
        flex flex-row justify-start
        border-1 border-accent 
        rounded-xl rounded-b-none
        flex-shrink-0
      ">
        {/* Tab triggers skeleton */}
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <Skeleton className="w-4 h-4" /> {/* Icon */}
            <Skeleton className="h-4 w-16" /> {/* Tab name */}
          </div>
        ))}
      </TabsList>

      {/* Tab content skeleton - Overview tab */}
      <TabsContent
        className="
          pt-5 pb-10 px-10 bg-secondary
          rounded-b-xl
          flex-1 overflow-y-auto
        "
        value="overview"
      >
        <DetailsOverviewSkeleton />
      </TabsContent>
    </Tabs>
  );
}

// Overview content skeleton
function DetailsOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      {/* Genre tags skeleton */}
      <div className="flex flex-row flex-wrap justify-center md:justify-start gap-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} className="h-6 w-16 rounded-full" />
        ))}
      </div>

      {/* Overview fields skeleton */}
      <div className="grid grid-cols-12 space-y-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-1 w-fit col-span-3">
            <Skeleton className="h-3 w-16" /> {/* Label */}
            <Skeleton className="h-4 w-20" /> {/* Value */}
          </div>
        ))}
      </div>

      {/* Description skeleton */}
      <div className="flex flex-col gap-2 -mt-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}