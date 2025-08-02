import { ImageSkeleton } from "@/components/image-skeleton";
import { Anime } from "@/types/anime";
import { AnilistCoverImage } from "@better-melon/shared/types";
import Image from "next/image";
import { useState } from "react";

export default function AnimeCardCoverImage({ 
  coverImage, 
  id, 
}: {
  coverImage: AnilistCoverImage;
  id: Anime['id'];
}) {
  const [imageLoading, setImageLoading] = useState<boolean>(true);

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