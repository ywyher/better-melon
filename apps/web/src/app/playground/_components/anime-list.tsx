'use client'
import { queryVariables } from "@/lib/constants/anime";
import { useAnimeList } from "@/lib/hooks/use-anime-list";
import { useEffect } from "react";

export default function AnimeListPlayground() {
  const { data } = useAnimeList({
    name: 'topAiring',
    variables: queryVariables.list.topAiring({}),
  });

  useEffect(() => {
    console.log("Data:", data);
  }, [data]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      HEY
    </div>
  );
}