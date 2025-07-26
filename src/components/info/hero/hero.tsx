'use client'

import { HeroBackground } from "@/components/info/hero/background";
import { HeroContent } from "@/components/info/hero/content";
import { HeroSkeleton } from "@/components/info/hero/skeleton";
import { Anime, AnimeCoverImage, AnimeFormat, AnimeTitle } from "@/types/anime"
import { useState } from "react";

export type HeroProps = {
  anime: Anime
  isLoading: boolean
}

export default function Hero({
  anime,
  isLoading
}: HeroProps) {
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  if(isLoading) return <HeroSkeleton />

  return (
    <div className="relative w-full min-h-[800px] lg:min-h-[500px]">
      <HeroBackground 
        bannerImage={anime.bannerImage}
        coverImage={anime.coverImage}
        id={anime.id}
        imageLoading={imageLoading}
        setImageLoading={setImageLoading}
      />
      <HeroContent 
        anime={anime}
      />
    </div>
  );
}