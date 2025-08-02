import AnimeCardSkeleton from "@/components/anime/card/default/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export function AnimeListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {/* Header skeleton */}
      <div className="flex flex-row gap-2 items-center">
        <Skeleton className="w-6 h-6" />
        <Skeleton className="h-6 w-32" />
      </div>
      
      {/* Scrollable cards skeleton */}
      <ScrollArea className="overflow-x-scroll">
        <div className="flex gap-4 pb-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}