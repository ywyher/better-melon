'use client'

import Details from "@/components/info/details/details";
import Hero from "@/components/info/hero/hero";
import { queryVariables } from "@/lib/constants/anime";
import { useAnimeData } from "@/lib/hooks/use-anime-data";
import { AnimeDynamic, AnimeInfo } from "@/types/anime";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function AnimeInfoPage() {
  const params = useParams();
  const animeId = Number(params.id);

  const { data: info } = useAnimeData<AnimeInfo>({
    animeId: animeId,
    name: 'info',
    variables: queryVariables.anime.info({ id: animeId }),
  });

  const { data: dynamicData } = useAnimeData<AnimeDynamic>({
    animeId: animeId,
    name: 'dynamic',
    variables: queryVariables.anime.dynamic({ id: animeId }),
  });

  const data = useMemo(() => {
    if (!info || !dynamicData) return null;
    return {
      ...info,
      ...dynamicData,
    };
  }, [info, dynamicData]) as AnimeInfo;

  const isLoading = useMemo(() => {
    return !info || !dynamicData;
  }, [info, dynamicData]);

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