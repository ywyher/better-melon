import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { Anime, AnimeTitle } from "@/types/anime";
import { KitsuAnimeEpisode } from "@/types/kitsu";
import { Play } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface ListViewProps {
  episodes: KitsuAnimeEpisode[];
  currentEpisode: number;
  animeId: Anime['id'];
  router: AppRouterInstance;
  animeTitle: AnimeTitle
  spoilerMode?: boolean;
}

export default function ListView({ 
  episodes,
  currentEpisode, 
  animeId, 
  router,
  animeTitle,
  spoilerMode = false,
}: ListViewProps) {
  return (
    <div className="flex flex-col gap-2">
      {episodes.map((ep) => {
        const number = ep.attributes.number
        const isActive = number == currentEpisode;
        return (

          <Button
            key={number}
            onClick={() => router.push(`/watch/${animeId}/${number}`)}
            variant="ghost"
            className={cn(
              "hover:scale-[1.009] transition-all",
              "text-muted-foreground border-1 border-transparent",
              "w-full py-3 flex justify-start gap-3 items-center rounded-lg bg-primary-foreground",
              "hover:bg-accent transition-all",
              "hover:text-white hover:border-white",
              isActive && "bg-accent"
            )}
          >
            <span className="font-bold min-w-[30px]">
              {isActive ? <Play fill="#fff" /> : number}
            </span>
            <span className="truncate text-left">
              {spoilerMode ? `${animeTitle.english}` : (ep.attributes.canonicalTitle || `Episode ${number}`)}
            </span>
          </Button>
        );
      })}
    </div>
  );
}