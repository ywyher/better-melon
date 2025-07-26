'use client'

import EpisodesList from "@/components/episodes-list/episodes-list";
import EpisodeSelector from "@/components/episodes-list/episodes-list";
import Details from "@/components/info/details/details";
import Hero from "@/components/info/hero/hero";
import { useAnimeData } from "@/lib/hooks/use-anime-data";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function AnimeData() {
  const params = useParams();
  const animeId = params.id as string;

  const { data, isLoading, error } = useAnimeData(animeId)

  return (
    <div className="flex flex-col gap-3">
      <Hero
        anime={data}
        isLoading={isLoading}
      />
      <Details
        anime={data}
        isLoading={isLoading}
      />
    </div>
  )
}