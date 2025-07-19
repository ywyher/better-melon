import { AnimeInList, AnimeInListVariables } from "@/types/anime";
import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { animeQueries } from "@/lib/queries/anime";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AnimeListSkeleton } from "@/components/home/anime-list/skeleton";
import AnimeListHeader from "@/components/home/anime-list/header";
import AnimeListScrollArea from "@/components/home/anime-list/scroll-area";
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
  const { 
    data, 
    isLoading, 
    error,
  }: UseQueryResult<AnilistResponse<"Page", { media: AnimeInList[] }>, Error> = useQuery({
    ...animeQueries.list(variables),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
    retry: 3,
  });

  const router = useRouter();
  const handleMoreClick = () => {
    router.push(`/search?query=&sort=${variables.sort}`);
  };

  if (isLoading || error) return <AnimeListSkeleton />;

  return (
    <div className="flex flex-col gap-2">
      <AnimeListHeader
        icon={icon}
        title={title}
        onViewAllClick={handleMoreClick}
      />
      <AnimeListScrollArea
        animeList={data!.Page.media}
        onMoreClick={handleMoreClick}
      />
    </div>
  );
}