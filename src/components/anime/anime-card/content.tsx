import AnimeCardCoverImage from "@/components/anime/anime-card/cover-image";
import AnimeCardOverlay from "@/components/anime/anime-card/overlay";
import AnimeCardTitle from "@/components/anime/anime-card/title";
import { CardContent } from "@/components/ui/card";
import { Anime, AnimeCoverImage, AnimeStatus, AnimeTitle } from "@/types/anime";

export default function AnimeCardContent({ 
  coverImage, 
  id, 
  imageLoading, 
  setImageLoading, 
  status, 
  title 
}: {
  id: Anime['id'];
  coverImage: AnimeCoverImage;
  imageLoading: boolean;
  setImageLoading: (loading: boolean) => void;
  status: AnimeStatus;
  title: AnimeTitle;
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
          imageLoading={imageLoading}
          setImageLoading={setImageLoading}
        />
        <AnimeCardOverlay />
      </div>
      <AnimeCardTitle status={status} title={title} />
    </CardContent>
  );
}