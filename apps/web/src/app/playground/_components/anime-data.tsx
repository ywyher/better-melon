'use client'
import { queryVariables } from "@/lib/constants/anime";
import { useAnimeData } from "@/lib/hooks/use-anime-data";
import { useEffect } from "react";

export default function AnimeDataPlayground() {
  const { data: StaticData } = useAnimeData({
    animeId: 97986,
    name: 'basic',
    variables: queryVariables.anime.basic({ id: 97986 }),
  });

  const { data: DynamicData } = useAnimeData({
    animeId: 97986,
    name: 'basic',
    variables: queryVariables.anime.dynamic({ id: 97986 }),
  });

  useEffect(() => {
    console.log("Dynamic Data:", DynamicData);
  }, [DynamicData]);

  useEffect(() => {
    console.log("Static Data:", StaticData);
  }, [StaticData]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      HEY
    </div>
  );
}