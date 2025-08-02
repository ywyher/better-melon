import AnimeCardContentWrapper from "@/components/anime/card/wrappers/content";
import { Anime } from "@/types/anime";
import { AnilistCoverImage, AnilistStatus, AnilistTitle } from "@better-melon/shared/types";

export default function AnimeCardContent({ 
  coverImage, 
  id, 
  status,
  title 
}: {
  id: Anime['id'];
  coverImage: AnilistCoverImage;
  status: AnilistStatus;
  title: AnilistTitle;
}) {
  return (
    <AnimeCardContentWrapper
      id={id}
      coverImage={coverImage}
      title={title}
      status={status}
    >
      <></>
    </AnimeCardContentWrapper>
  );
}