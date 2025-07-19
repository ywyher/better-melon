import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AnimeCardFooter from "@/components/anime/anime-card/footer";
import AnimeCardContent from "@/components/anime/anime-card/content";
import type { Anime, AnimeCoverImage, AnimeFormat, AnimeRelatoinType, AnimeStatus, AnimeTitle } from "@/types/anime";
import { cn } from "@/lib/utils/utils";

type AnimeCardProps = {
  id: Anime['id'];
  title: AnimeTitle;
  coverImage: AnimeCoverImage;
  status: AnimeStatus;
  format: AnimeFormat;
  seasonYear: Anime["seasonYear"]
  averageScore: Anime['averageScore']
  relationType?: AnimeRelatoinType
  className?: string
}

export default function AnimeCard({ 
  id,
  title,
  coverImage,
  status,
  format,
  seasonYear,
  averageScore,
  relationType,
  className
}: AnimeCardProps) {
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  const router = useRouter();

  const handleClick = () => {
    router.push(`/info/${id}`);
  };
  
  return (
    <Card 
      className={cn(
        "aspect-[3/4] relative p-0 max-h-100 w-full bg-transparent",
        "border-0 outline-0 shadow-none",
        "flex flex-col gap-2",
        className
      )}
      onClick={handleClick}
    >
      <AnimeCardContent
        id={id}
        coverImage={coverImage}
        imageLoading={imageLoading}
        setImageLoading={setImageLoading}
        status={status}
        title={title}
      />
      
      <AnimeCardFooter
        format={format}
        seasonYear={seasonYear}
        relationType={relationType}
        averageScore={averageScore}
      />
    </Card>
  );
}