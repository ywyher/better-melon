import AnimeCardInfoBadge from "@/components/anime/anime-card/info-badge";
import { CardFooter } from "@/components/ui/card";
import { AnimeFormat, AnimeRelatoinType } from "@/types/anime";
import { Star } from "lucide-react";

export default function AnimeCardFooter({ 
  format, 
  seasonYear, 
  averageScore,
  relationType
}: {
  format: AnimeFormat;
  seasonYear: number | null;
  averageScore: number | null;
  relationType?: AnimeRelatoinType
}) {
  return (
    <CardFooter className="flex flex-row gap-2 pl-1">
      {relationType ? (
        <>
          <AnimeCardInfoBadge variant="default">{relationType.replace("_", " ")}</AnimeCardInfoBadge>
          <AnimeCardInfoBadge>{format}</AnimeCardInfoBadge>
        </>
      ): (
        <>
          <AnimeCardInfoBadge>{seasonYear || "UNKNOWN"}</AnimeCardInfoBadge>
          <AnimeCardInfoBadge>
            <Star />
            {averageScore || 0}
          </AnimeCardInfoBadge>
          <AnimeCardInfoBadge>{format}</AnimeCardInfoBadge>
        </>
      )}
    </CardFooter>
  );
}