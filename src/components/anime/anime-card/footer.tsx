import AnimeCardInfoBadge from "@/components/anime/anime-card/info-badge";
import { CardFooter } from "@/components/ui/card";
import { AnimeFormat } from "@/types/anime";
import { Star } from "lucide-react";

export default function AnimeCardFooter({ 
  format, 
  seasonYear, 
  averageScore 
}: {
  format: AnimeFormat;
  seasonYear: number | null;
  averageScore: number | null;
}) {
  return (
    <CardFooter className="flex flex-row gap-2 pl-1">
      <AnimeCardInfoBadge>{format}</AnimeCardInfoBadge>
      <AnimeCardInfoBadge>{seasonYear || "UNKNOWN"}</AnimeCardInfoBadge>
      <AnimeCardInfoBadge>
        <Star />
        {averageScore || 0}
      </AnimeCardInfoBadge>
    </CardFooter>
  );
}