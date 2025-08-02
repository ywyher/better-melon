import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/utils";

interface AnimeHistoryCardSkeletonProps {
  className?: string;
}

export default function AnimeHistoryCardSkeleton({ 
  className 
}: AnimeHistoryCardSkeletonProps) {
  return (
    <Card
      className={cn(
        "aspect-[3/4] relative p-0 max-h-100 w-50 bg-transparent",
        "border-0 outline-0 shadow-none",
        "flex flex-col gap-2",
        className
      )}
    >
      <CardContent className="p-0 flex flex-col gap-3">
        <div className="h-70 relative cursor-pointer group">
          {/* Cover Image Skeleton */}
          <Skeleton className="w-full h-full rounded-lg" />
          
          {/* Progress Bar Area Skeleton */}
          <div className="absolute bottom-0 left-0 right-0 p-2 z-10">
            <div className="flex flex-col gap-2">
              {/* Episode Badge Skeleton */}
              <Skeleton className="h-6 w-12 rounded-full" />
              {/* Progress Bar Skeleton */}
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        </div>
        
        {/* Title Skeleton */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
      
      {/* Footer Skeleton */}
      <CardFooter className="p-0 m-0">
        <Skeleton className="h-4 w-20" />
      </CardFooter>
    </Card>
  );
}