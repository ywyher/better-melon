import { ImageSkeleton } from "@/components/image-skeleton";
import { AnimeTitle } from "@/types/anime";
import Image from "next/image";

export function InfoHeroBackground({ bannerImage, title, imageLoading, setImageLoading }: {
  bannerImage: string;
  title: AnimeTitle;
  imageLoading: boolean;
  setImageLoading: (loading: boolean) => void;
}) {
  return (
    <>
      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/70 to-background/60 backdrop-blur-xs z-[3] rounded-xl" />
      {imageLoading && <ImageSkeleton />}
      <Image
        src={bannerImage}
        alt={title.english}
        fill
        className="rounded-xl"
        onLoadingComplete={() => setImageLoading(false)}
      />
    </>
  );
}