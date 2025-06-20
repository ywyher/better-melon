import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { Anime, AnimeEpisodeMetadata } from "@/types/anime";
import { Play } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface GridViewProps {
  episodes: AnimeEpisodeMetadata[];
  currentEpisode: number;
  animeId: Anime['id'];
  router: AppRouterInstance;
}

export default function GridView({ episodes, currentEpisode, animeId, router }: GridViewProps) {
  return (
    <div className="flex flex-row gap-2 flex-wrap">
      {episodes.map((ep) => {
        const isActive = ep.number == currentEpisode;
        return (
          <Button
            key={ep.id}
            variant="ghost"
            onClick={() => router.push(`/watch/${animeId}/${ep.number}`)}
            className={cn(
              "hover:scale-105 transition-all",
              "py-0 w-10 rounded-lg bg-[#141414]",
              "hover:bg-[#2B2B2B] hover:border-white transition-all",
              "w-[70px] max-h-[100px] py-[0.4rem]",
              "scale-95 hover:scale-100",
              "text-gray-400 hover:text-white",
              isActive && "bg-[#8080CF] hover:bg-[#9999D9]"
            )}
          >
            {isActive ? <Play fill="#fff" /> : ep.number}
          </Button>
        );
      })}
    </div>
  );
}