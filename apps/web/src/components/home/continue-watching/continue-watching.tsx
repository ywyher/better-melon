import { History, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimeListSkeleton } from "@/components/home/anime-list/skeleton";
import AnimeListHeader from "@/components/home/anime-list/header";
import { useQuery } from "@tanstack/react-query";
import { animeQueries } from "@/lib/queries/anime";
import ListScrollAreaWrapper from "@/components/home/wrappers/scroll-area";
import AnimeHistoryCard from "@/components/anime/card/history/card";
import { getPercentage } from "@/lib/utils/utils";
import { Card, CardContent } from "@/components/ui/card";


export default function ContinueWatching() {
  const { data: history, error, isLoading } = useQuery({
    ...animeQueries.history({ limit: 10 })
  })
  const router = useRouter();
  const handleMoreClick = () => {
    router.push(`/history`);
  };

  if (isLoading || error) return <AnimeListSkeleton />;

  return (
    <div className="flex flex-col gap-3">
      <AnimeListHeader
        icon={History}
        title={"Continue Watching"}
        onViewAllClick={handleMoreClick}
      />
      {history?.length ? (
        <ListScrollAreaWrapper
          onMoreClick={handleMoreClick}
          showMore={history.length >= 10}
        >
          {history.map((anime) => (
            <AnimeHistoryCard
              key={anime.id}
              id={Number(anime.animeId)}
              title={anime.animeTitle}
              coverImage={anime.animeCoverImage}
              episodeNumber={anime.animeEpisode}
              percentage={getPercentage({ progress: anime.progress, duration: anime.duration })}
            />
          ))}
        </ListScrollAreaWrapper>
      ): (
        <Card className="
          flex justify-center items-center
          border-dashed border-2
          w-full min-h-[300px]
        ">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <Play className="w-12 h-12 opacity-50" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium">No anime history yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Start watching anime to build your viewing history and see it displayed here!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}