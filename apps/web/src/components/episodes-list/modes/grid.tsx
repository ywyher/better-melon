import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { Anime } from "@/types/anime";
import { KitsuAnimeEpisode } from "@better-melon/shared/types";
import { Play } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface GridViewProps {
  animeId: Anime['id'];
  router: AppRouterInstance;
  episodes: KitsuAnimeEpisode[];
  currentEpisode: number;
}

export default function GridView({ episodes, currentEpisode, animeId, router }: GridViewProps) {
  return (
    <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
      {episodes.map((ep) => {
        const number = ep.attributes.number
        const isActive = number == currentEpisode;
        
        return (
          <Button
            key={number}
            variant="ghost"
            onClick={() => router.push(`/watch/${animeId}/${number}`)}
            className={cn(
              "hover:scale-105 transition-all",
              "rounded-lg bg-primary-foreground",
              "hover:bg-accent transition-all",
              "w-full aspect-square py-4",
              "scale-95 hover:scale-100",
              "text-muted-foreground border-1 border-transparent",
              "hover:text-white hover:border-white",
              number == 1 && "bg-accent"
            )}
          >
            {isActive ? <Play fill="#fff" /> : number}
          </Button>
        );
      })}
    </div>
  );
}