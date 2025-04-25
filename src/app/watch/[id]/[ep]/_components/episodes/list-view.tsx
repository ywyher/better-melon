import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Anime, AnimeEpisodeData } from "@/types/anime";
import { Play } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface ListViewProps {
  episodes: AnimeEpisodeData[];
  currentEpisode: number;
  animeId: Anime['id'];
  router: AppRouterInstance;
  spoilerMode?: boolean;
  animeData: Anime;
}

export default function ListView({ 
  episodes, 
  currentEpisode, 
  animeId, 
  router,
  spoilerMode = false,
  animeData
}: ListViewProps) {
  const genericTitle = animeData.title.english || "Episode";

  return (
    <div className="flex flex-col gap-2">
      {episodes.map((ep) => {
        const isActive = ep.number == currentEpisode;
        return (
          <Button
            key={ep.id}
            onClick={() => router.push(`/watch/${animeId}/${ep.number}`)}
            variant="ghost"
            className={cn(
              "hover:scale-105 transition-all",
              "w-full py-3 flex justify-start gap-3 items-center rounded-lg bg-[#141414]",
              "hover:bg-[#2B2B2B] transition-all",
              "text-gray-400 hover:text-white",
              isActive && "bg-[#8080CF] hover:bg-[#9999D9]"
            )}
          >
            <span className="font-bold min-w-[30px]">
              {isActive ? <Play fill="#fff" /> : ep.number}
            </span>
            <span className="truncate text-left">
              {spoilerMode ? `${genericTitle}` : (ep.title || `Episode ${ep.number}`)}
            </span>
          </Button>
        );
      })}
    </div>
  );
}