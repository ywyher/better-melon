import { Badge } from "@/components/ui/badge";
import { AnimeFormat } from "@/types/anime";
import { Calendar, Camera, Film, Star } from "lucide-react";

export default function InfoHeroStatsBar({ averageScore, seasonYear, format, episodes }: {
  averageScore: number;
  seasonYear: number;
  format: AnimeFormat;
  episodes: number;
}) {
  return (
    <div className="flex flex-row gap-2">
      <Badge className="border-none bg-black/40" variant="outline">
        <Star /> {averageScore}
      </Badge>
      <Badge className="px-3 bg-black/40" variant="secondary">
        <Calendar /> {seasonYear}
      </Badge>
      <Badge className="px-3 bg-black/40" variant="secondary">
        <Film /> {format}
      </Badge>
      <Badge className="px-3 bg-black/40" variant="secondary">
        <Camera /> {episodes}
      </Badge>
    </div>
  );
}
