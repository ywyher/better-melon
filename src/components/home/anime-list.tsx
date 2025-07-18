import { AnimeInList, AnimeInListVariables } from "@/types/anime";
import { ChevronRight, LucideIcon } from "lucide-react";
import AnimeCard, { AnimeCardSkeleton } from "@/components/anime/anime-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import MoreCard from "@/components/more-card";
import { Button } from "@/components/ui/button";
import { animeQueries } from "@/lib/queries/anime";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import type { AnilistResponse } from "@/types/anilist";

type AnimeListProps = {
  title: string;
  icon: LucideIcon;
  variables: AnimeInListVariables;
}

export default function AnimeList({
  title,
  icon,
  variables
}: AnimeListProps) {
  const Icon = icon;
  const router = useRouter();
  
  const { 
    data, 
    isLoading, 
    error,
  }: UseQueryResult<AnilistResponse<"Page", { media: AnimeInList[] }>, Error> = useQuery({
    ...animeQueries.list(variables),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
    retry: 3,
  })

  const handleMoreClick = () => {
    router.push(`/search?query=&sort=${variables.sort}`);
  };

  if(isLoading || error) return <AnimeListSkeleton />

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex flex-row gap-5 items-center">
          <Icon color="#6366F1" size={30} />
          <span className="text-2xl font-bold">{title}</span>
        </div>
        <Button 
          variant="outline"
          className="flex flex-row gap-3"
          onClick={() => handleMoreClick()}
        >
          View All
          <ChevronRight />
        </Button>
      </div>
      <ScrollArea
        className="
          h-[380px] w-full
          overflow-x-scroll whitespace-nowrap
        "
      >
        <div
          className="flex flex-row gap-8 w-max py-2"
        >
          {data?.Page.media.map((a) => (
            <AnimeCard
              key={a.id}
              id={a.id}
              title={a.title}
              format={a.format}
              coverImage={a.coverImage}
              averageScore={a.averageScore!}
              seasonYear={a.seasonYear!}
              status={a.status!}
            />
          ))}
          <MoreCard onClick={handleMoreClick} />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

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