import AnimeCard from "@/components/anime/anime-card/anime-card";
import MoreCard from "@/components/more-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AnimeInListHome } from "@/types/anime";

export default function AnimeListScrollArea({ 
  animeList, 
  onMoreClick 
}: {
  animeList: AnimeInListHome[];
  onMoreClick: () => void;
}) {
  return (
    <ScrollArea
      className="
        h-[380px] w-full
        overflow-x-scroll whitespace-nowrap
      "
    >
      <div className="flex flex-row gap-8 w-max py-2">
        {animeList.map((anime) => (
          <AnimeCard
            key={anime.id}
            id={anime.id}
            title={anime.title}
            format={anime.format}
            coverImage={anime.coverImage}
            averageScore={anime.averageScore!}
            seasonYear={anime.seasonYear!}
            status={anime.status!}
          />
        ))}
        <MoreCard onClick={onMoreClick} />
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}