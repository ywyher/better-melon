'use client'

import InfoHero from "@/components/info/hero/hero";
import { useAnimeData } from "@/lib/hooks/use-anime-data";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function AnimeData() {
  const params = useParams();
  const animeId = params.id as string;

  const { data, isLoading, error } = useAnimeData(animeId)

  return (
    <>
      <InfoHero
        averageScore={data.averageScore}
        bannerImage={data.bannerImage}
        coverImage={data.coverImage}
        duration={data.duration}
        episodes={data.episodes}
        format={data.format}
        genres={data.genres}
        id={data.id}
        seasonYear={data.seasonYear}
        title={data.title}
        isLoading={isLoading}
      />
    </>
  )
}