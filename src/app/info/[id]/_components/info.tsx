'use client'

import { AnimeDescription } from "@/app/info/[id]/_components/description"
import { AnimeEpisodes } from "@/app/info/[id]/_components/episodes"
import { AnimeCard } from "@/app/info/[id]/_components/card"
import { AnimeLayout } from "@/app/info/[id]/_components/layout"
import { useEffect, useState } from "react"
import { useQuery } from "@apollo/client"
import { AnimeDataSkeleton } from "@/app/info/[id]/_components/skeleton"
import { Indicator } from "@/components/indicator"
import { Anime } from "@/types/anime"
import { useRouter, useSearchParams } from "next/navigation"
import AddToList from "@/components/add-to-list/add-to-list"
import { useQueryClient } from "@tanstack/react-query"
import { useTokenizer } from "@/lib/hooks/use-tokenizer"
import { useAnimeData } from "@/lib/hooks/use-anime-data"

type AnimeInfoProps = {
  animeId: Anime['id']
}

export default function AnimeData({ 
  animeId
}: AnimeInfoProps) {
  const [isAddToList, setIsAddToList] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient()
  const {
    animeData,
    isLoading,
    error,
    refetch
  } = useAnimeData(String(animeId))
  
  useEffect(() => {
    const addToList = searchParams.get('addToList');
    setIsAddToList(addToList === 'true');
  }, [searchParams]);

  const {
    initalize,
    isInitialized
  } = useTokenizer()

  useEffect(() => {
    const prefetch = async () => {
      queryClient.prefetchQuery({
        queryKey: ['prefetch-tokenizer'],
        queryFn: async () => {
          if(isInitialized) return;
          await initalize()
          return ""
        },
        staleTime: Infinity, // Keep result forever once fetched
        gcTime: 24 * 60 * 60 * 1000, // 24 hours garbage collection time
      })
    }

    if(animeData) {
      // Use a timeout to delay prefetch and allow images to load first
      const timeoutId = setTimeout(() => {
        prefetch();
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [queryClient, animeData])
  
  if (isLoading || !animeData) return <AnimeDataSkeleton />
  if (error) return <Indicator onRetry={() => refetch()} type="error" message={error.message} />

  return (
    <AnimeLayout
      bannerImage={animeData.bannerImage} 
      title={animeData.title}
      router={router}
    >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <AnimeCard 
                    coverImage={animeData.coverImage} 
                    title={animeData.title}
                    format={animeData.format}
                    status={animeData.status}
                    season={animeData.season}
                    seasonYear={animeData.seasonYear}
                    genres={animeData.genres}
                />
            </div>
            <div className="flex flex-col gap-6 md:col-span-2">
              <AddToList 
                animeId={animeId}
                isAddToList={isAddToList}
              />

              <AnimeEpisodes 
                  id={animeId}
                  episodes={animeData.episodes}
                  nextAiringEpisode={animeData.nextAiringEpisode}
                  router={router}
              />

              <AnimeDescription 
                  title={animeData.title}
                  description={animeData.description}
              />
            </div>
        </div>
    </AnimeLayout>
  )
}