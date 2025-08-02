import AnimeHistoryCardContent from "@/components/anime/card/history/content";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/utils";
import { AnilistCoverImage, AnilistTitle } from "@better-melon/shared/types";
import { Anime } from "@/types/anime";
import AnimeCardWrapper from "@/components/anime/card/wrappers/card";
import AnimeHistoryCardFooter from "@/components/anime/card/history/footer";

type AnimeCardProps = {
  id: Anime['id'];
  title: AnilistTitle;
  coverImage: AnilistCoverImage;
  episodeNumber: number;
  percentage: number;
  className?: string
}

export default function AnimeHistoryCard({
  id,
  title,
  coverImage,
  episodeNumber,
  percentage,
  className
}: AnimeCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/watch/${id}/${episodeNumber}`);
  };

  return (
    <AnimeCardWrapper
      handleClick={handleClick}
      className={className}
    >
      <AnimeHistoryCardContent
        id={id}
        coverImage={coverImage}
        episodeNumber={episodeNumber}
        title={title}
        percentage={percentage}
      />
      <AnimeHistoryCardFooter percentage={percentage} />
    </AnimeCardWrapper>
  );
}