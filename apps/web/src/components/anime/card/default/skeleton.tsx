import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnimeCardSkeleton() {
  return (
    <Card
      className="
        relative w-50 h-70 p-0
        border-0 outline-0 shadow-none
        flex flex-col gap-2
      "
    >
      <CardContent className="p-0 flex flex-col gap-3">
        {/* Image skeleton */}
        <div className="h-70 relative">
          <Skeleton className="w-full h-full rounded-sm" />
        </div>

        {/* Title section skeleton */}
        <div className="
          flex flex-row gap-2 pl-1 py-1
          rounded-sm
        ">
          {/* Status indicator skeleton */}
          <Skeleton className="w-3 h-3 rounded-full" />
          
          {/* Title skeleton */}
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter
        className="
          flex flex-row gap-2
          pl-1
        "
      >
        {/* Badge skeletons */}
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </CardFooter>
    </Card>
  );
}