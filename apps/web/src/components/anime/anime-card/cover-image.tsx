import { ImageSkeleton } from "@/components/image-skeleton";
import { Anime, AnimeCoverImage } from "@/types/anime";
import Image from "next/image";

export default function AnimeCardCoverImage({ 
  coverImage, 
  id, 
  imageLoading, 
  setImageLoading 
}: {
  coverImage: AnimeCoverImage;
  id: Anime['id'];
  imageLoading: boolean;
  setImageLoading: (loading: boolean) => void;
}) {
  return (
    <>
      {imageLoading && <ImageSkeleton />}
      <Image
        src={coverImage.extraLarge || coverImage.large}
        alt={String(id)}
        fill
        className="rounded-sm transition-all object-cover"
        loading="lazy"
        onLoadingComplete={() => setImageLoading(false)}
      />
    </>
  );
}