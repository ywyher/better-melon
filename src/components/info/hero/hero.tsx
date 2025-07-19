'use client'

import { InfoHeroBackground } from "@/components/info/hero/background";
import { InfoHeroContent } from "@/components/info/hero/content";
import { InfoHeroSkeleton } from "@/components/info/hero/skeleton";
import { Anime, AnimeCoverImage, AnimeFormat, AnimeTitle } from "@/types/anime"
import { useState } from "react";

export type HeroProps = {
  id: Anime['id'];
  title: AnimeTitle;
  seasonYear: Anime['seasonYear'];
  genres: Anime['genres'];
  episodes: Anime['episodes'];
  averageScore: Anime['averageScore'];
  bannerImage: Anime['bannerImage'];
  coverImage: AnimeCoverImage;
  duration: Anime['duration'];
  format: AnimeFormat;
  isLoading: boolean
}

export default function InfoHero({
  id,
  title,
  seasonYear,
  genres,
  episodes,
  averageScore,
  bannerImage,
  coverImage,
  duration,
  format,
  isLoading
}: HeroProps) {
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  if(isLoading) return <InfoHeroSkeleton />

  return (
    <div className="relative w-full min-h-[500px]">
      <InfoHeroBackground 
        bannerImage={bannerImage}
        title={title}
        imageLoading={imageLoading}
        setImageLoading={setImageLoading}
      />
      <InfoHeroContent 
        id={id}
        title={title}
        seasonYear={seasonYear}
        genres={genres}
        episodes={episodes}
        averageScore={averageScore}
        format={format}
        coverImage={coverImage}
        duration={duration}
      />
    </div>
  );
}