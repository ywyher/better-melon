import { useRouter } from "next/navigation";
import { useState } from "react";
import AnimeCardFooter from "@/components/anime/card/default/footer";
import AnimeCardContent from "@/components/anime/card/default/content";
import { AnilistCoverImage, AnilistFormat, AnilistStatus, AnilistTitle } from "@better-melon/shared/types";
import { Anime } from "@/types/anime";
import { AnilistRelationType } from "@/types/anilist/anime";
import AnimeCardWrapper from "@/components/anime/card/wrappers/card";

type AnimeCardProps = {
  id: Anime['id'];
  title: AnilistTitle;
  coverImage: AnilistCoverImage;
  status: AnilistStatus;
  format: AnilistFormat;
  seasonYear: Anime["seasonYear"]
  averageScore: Anime['averageScore']
  relationType?: AnilistRelationType
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
    <AnimeCardWrapper
      handleClick={handleClick}
      className={className}
    >
      <AnimeCardContent
        id={id}
        coverImage={coverImage}
        status={status}
        title={title}
      />
      
      <AnimeCardFooter
        format={format}
        seasonYear={seasonYear}
        relationType={relationType}
        averageScore={averageScore}
      />
    </AnimeCardWrapper>
  );
}