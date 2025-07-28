import { AnimeInListHome, AnimeListQueryVariableKeys, AnimeListQueryVariables } from "@/types/anime";
import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimeListSkeleton } from "@/components/home/anime-list/skeleton";
import AnimeListHeader from "@/components/home/anime-list/header";
import AnimeListScrollArea from "@/components/home/anime-list/scroll-area";
import { useAnimeList } from "@/lib/hooks/use-anime-list";

type AnimeListProps = {
  title: string;
  name: AnimeListQueryVariableKeys
  icon: LucideIcon;
  variables: AnimeListQueryVariables;
}

export default function AnimeList({
  title,
  name,
  icon,
  variables
}: AnimeListProps) {
  const { data, error, isLoading } = useAnimeList<AnimeInListHome[]>({
    name,
    variables
  })
  const router = useRouter();
  const handleMoreClick = () => {
    router.push(`/search?query=&sorts=${variables.sorts}`);
  };

  if (isLoading || error) return <AnimeListSkeleton />;

  return (
    <div className="flex flex-col gap-2">
      <AnimeListHeader
        icon={icon}
        title={title}
        onViewAllClick={handleMoreClick}
      />
      {data?.Page.media && (
        <AnimeListScrollArea
          animeList={data.Page.media}
          onMoreClick={handleMoreClick}
        />
      )}
    </div>
  );
}