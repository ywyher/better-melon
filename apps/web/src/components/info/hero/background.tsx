import { ImageSkeleton } from "@/components/image-skeleton";
import { cn } from "@/lib/utils/utils";
import { Anime } from "@/types/anime";
import { AnilistCoverImage } from "@better-melon/shared/types";
import Image from "next/image";

export function HeroBackground({ bannerImage, coverImage, id, imageLoading, setImageLoading }: {
  bannerImage: string;
  coverImage: AnilistCoverImage
  id: Anime['id'];
  imageLoading: boolean;
  setImageLoading: (loading: boolean) => void;
}) {
  if(!bannerImage && !coverImage.extraLarge) return;

  return (
    <>
      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/70 to-background/60 backdrop-blur-xs z-[3] rounded-xl" />
      {imageLoading && <ImageSkeleton />}
      <Image
        src={bannerImage || (coverImage.extraLarge || "")}
        alt={String(id)}
        fill
        className={cn(
          "rounded-xl",
          !bannerImage && "object-cover"
        )}
        onLoadingComplete={() => setImageLoading(false)}
      />
    </>
  );
}