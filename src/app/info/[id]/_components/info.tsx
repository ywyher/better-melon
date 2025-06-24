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
import { GET_ANIME } from "@/lib/graphql/queries"
import { initializeTokenizerAction } from "@/lib/subtitle/actions"
import { useInitializeTokenizer } from "@/lib/hooks/use-initialize-tokenizer"

type AnimeInfoProps = {
  animeId: Anime['id']
}

export default function AnimeData({ 
  animeId
}: AnimeInfoProps) {
  const [isAddToList, setIsAddToList] = useState<boolean>(false);
  const [anime, setAnime] = useState<Anime | null>(null)
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const addToList = searchParams.get('addToList');
    setIsAddToList(addToList === 'true');
  }, [searchParams]);

  const { data: animeData, loading: isAnimeDataLoading, error: animeError, refetch: animeRefetch } = useQuery(GET_ANIME, { 
    variables: { id: Number(animeId) },
    fetchPolicy: 'cache-first',
  });

  const {
    initalize,
    isInitialized
  } = useInitializeTokenizer()

  useEffect(() =>{ 
    if(animeData) {
      setAnime(animeData.Media)
    }
  }, [animeData])

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

    if(anime) {
      // Use a timeout to delay prefetch and allow images to load first
      const timeoutId = setTimeout(() => {
        prefetch();
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [queryClient, anime])
  
  if (isAnimeDataLoading || !anime) return <AnimeDataSkeleton />
  if (animeError) return <Indicator onRetry={() => animeRefetch()} type="error" message={animeError.message} />


  return (
    <AnimeLayout
      bannerImage={anime.bannerImage} 
      title={anime.title}
      router={router}
    >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <AnimeCard 
                    coverImage={anime.coverImage} 
                    title={anime.title}
                    format={anime.format}
                    status={anime.status}
                    season={anime.season}
                    seasonYear={anime.seasonYear}
                    genres={anime.genres}
                />
            </div>
            <div className="flex flex-col gap-6 md:col-span-2">
              <AddToList 
                animeId={animeId}
                isAddToList={isAddToList}
              />

              <AnimeEpisodes 
                  id={animeId}
                  episodes={anime.episodes}
                  nextAiringEpisode={anime.nextAiringEpisode}
                  router={router}
              />

              <AnimeDescription 
                  title={anime.title}
                  description={anime.description}
              />
            </div>
        </div>
    </AnimeLayout>
  )
}