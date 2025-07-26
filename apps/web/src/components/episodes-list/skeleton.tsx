import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/utils";

type EpisodesListSkeletonProps = {
  className?: string;
  viewMode?: "grid" | "list" | "image";
  itemCount?: number;
}

export default function EpisodesListSkeleton({ 
  className = "",
  viewMode = "image",
  itemCount = 12
}: EpisodesListSkeletonProps) {
  return (
    <Card 
      className={cn(
        "max-h-[80vh] min-w-[500px] bg-secondary",
        className
      )}
    >
      <CardHeader className="flex flex-col gap-3">
        <div className="flex flex-row gap-2 items-center w-full">
          <div className="flex flex-row gap-2 items-center w-full">
            {/* Episodes selector skeleton */}
            <Skeleton className="w-28 h-9" />
            
            {/* Search input skeleton */}
            <div className="relative flex-1 w-full">
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
          
          {/* Action buttons skeleton */}
          <div className="flex gap-2">
            <Skeleton className="w-9 h-9" />
            <Skeleton className="w-9 h-9" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative h-fit min-h-[10vh] w-full overflow-y-auto">
        {viewMode === "grid" && <GridSkeleton itemCount={itemCount} />}
        {viewMode === "list" && <ListSkeleton itemCount={itemCount} />}
        {viewMode === "image" && <ImageSkeleton itemCount={itemCount} />}
      </CardContent>
    </Card>
  );
}

// Grid view skeleton
function GridSkeleton({ itemCount }: { itemCount: number }) {
  return (
    <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
      {Array.from({ length: itemCount }).map((_, idx) => (
        <Skeleton 
          key={idx}
          className="w-full aspect-square rounded-lg"
        />
      ))}
    </div>
  );
}

// List view skeleton
function ListSkeleton({ itemCount }: { itemCount: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: itemCount }).map((_, idx) => (
        <div
          key={idx}
          className="w-full py-3 flex justify-start gap-3 items-center rounded-lg bg-primary-foreground"
        >
          <Skeleton className="w-[30px] h-6 flex-shrink-0" />
          <Skeleton className="h-4 flex-1 max-w-[60%]" />
        </div>
      ))}
    </div>
  );
}

// Image view skeleton
function ImageSkeleton({ itemCount }: { itemCount: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: itemCount }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-row rounded-lg overflow-hidden bg-primary-foreground"
        >
          {/* Left side - Image skeleton */}
          <div className="relative h-24 w-36 flex-shrink-0">
            <Skeleton className="w-full h-full" />
            {/* Episode number skeleton */}
            <div className="absolute bottom-2 left-2">
              <Skeleton className="w-10 h-4 rounded-md" />
            </div>
          </div>
          
          {/* Right side - Text content skeleton */}
          <div className="flex flex-col gap-2 p-3 flex-grow">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}