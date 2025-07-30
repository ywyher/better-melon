import { ImageSkeleton } from "@/components/image-skeleton";
import { Anime } from "@/types/anime";
import { AnilistCoverImage } from "@better-melon/shared/types";
import Image from "next/image";

export default function AnimeCardCoverImage({ 
  coverImage, 
  id, 
  imageLoading, 
  setImageLoading 
}: {
  coverImage: AnilistCoverImage;
  id: Anime['id'];
  imageLoading: boolean;
  setImageLoading: (loading: boolean) => void;
}) {
  return (
    <>
      {imageLoading && <ImageSkeleton />}
      <Image
        src={coverImage?.extraLarge || coverImage?.large}
        alt={String(id)}
        fill
        className="rounded-sm transition-all object-cover"
        loading="lazy"
        onLoadingComplete={() => setImageLoading(false)}
      />
    </>
  );
}