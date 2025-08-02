import AnimeCardCoverImage from "@/components/anime/card/cover-image";
import AnimeCardOverlay from "@/components/anime/card/overlay";
import AnimeCardTitle from "@/components/anime/card/title";
import { CardContent } from "@/components/ui/card";
import { Anime } from "@/types/anime";
import { AnilistCoverImage, AnilistStatus, AnilistTitle } from "@better-melon/shared/types";
import { ReactNode } from "react";

export default function AnimeCardContentWrapper({ 
  coverImage, 
  id,
  title,
  status, 
  children
}: {
  id: Anime['id'];
  coverImage: AnilistCoverImage;
  title: AnilistTitle;
  status?: AnilistStatus,
  children: ReactNode
}) {
  return (
    <CardContent className="p-0 flex flex-col gap-3">
      <div className="
        h-70 relative
        cursor-pointer
        group
        hover:-translate-y-1.5 transition-all
      ">
        <AnimeCardCoverImage 
          id={id}
          coverImage={coverImage}
        />
        {children}
        <AnimeCardOverlay />
      </div>
      <AnimeCardTitle status={status} title={title} />
    </CardContent>
  );
}