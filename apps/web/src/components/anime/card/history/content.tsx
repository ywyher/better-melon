import AnimeHistoryCardProgressBar from "@/components/anime/card/history/progress-bar";
import AnimeCardContentWrapper from "@/components/anime/card/wrappers/content";
import { Anime } from "@/types/anime";
import { AnilistCoverImage, AnilistTitle } from "@better-melon/shared/types";

export default function AnimeHistoryCardContent({ 
  coverImage, 
  id,
  title,
  episodeNumber,
  percentage
}: {
  id: Anime['id'];
  coverImage: AnilistCoverImage;
  title: AnilistTitle;
  episodeNumber: number;
  percentage: number
}) {
  return (
    <AnimeCardContentWrapper
      id={id}
      coverImage={coverImage}
      title={title}
    >
      <AnimeHistoryCardProgressBar episodeNumber={episodeNumber} percentage={percentage} />
    </AnimeCardContentWrapper>
  );
}