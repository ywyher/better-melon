import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AnimeCardFooter from "@/components/anime/anime-card/footer";
import AnimeCardContent from "@/components/anime/anime-card/content";
import type { Anime, AnimeCoverImage, AnimeFormat, AnimeStatus, AnimeTitle } from "@/types/anime";

type AnimeCardProps = {
  id: Anime['id'];
  title: AnimeTitle;
  coverImage: AnimeCoverImage;
  status: AnimeStatus;
  format: AnimeFormat;
  seasonYear: Anime["seasonYear"]
  averageScore: Anime['averageScore']
}

export default function AnimeCard({ 
  id,
  title,
  coverImage,
  status,
  format,
  seasonYear,
  averageScore
}: AnimeCardProps) {
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  const router = useRouter();

  const handleClick = () => {
    router.push(`/info/${id}`);
  };
  
  return (
    <Card 
      className="
        relative w-50 h-70 p-0
        border-0 outline-0 shadow-none
        flex flex-col gap-2
      "
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
        averageScore={averageScore}
      />
    </Card>
  );
}