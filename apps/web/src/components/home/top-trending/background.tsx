import { ImageSkeleton } from "@/components/image-skeleton";
import Image from "next/image";

export default function TopTrendingBackground({ 
  bannerImage, 
  title, 
  imageLoading, 
  setImageLoading 
}: {
  bannerImage: string;
  title: string;
  imageLoading: boolean;
  setImageLoading: (loading: boolean) => void;
}) {
  return (
    <>
      {imageLoading && <ImageSkeleton />}
      <Image
        src={bannerImage}
        alt={title}
        fill
        loading="lazy"
        className="rounded-lg"
        onLoadingComplete={() => setImageLoading(false)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent z-[3]" />
    </>
  );
}