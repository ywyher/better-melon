"use client"

import { AnimeDescription } from "@/app/info/[id]/_components/description"
import { AnimeEpisodes } from "@/app/info/[id]/_components/episodes"
import { AnimeInfo } from "@/app/info/[id]/_components/info"
import { AnimeLayout } from "@/app/info/[id]/_components/layout"
import { AnimeDataSkeleton } from "@/app/info/[id]/_components/skeleton"
import { Anime } from "@/types/anime"
import { Indicator } from "@/components/indicator"
import { gql, useQuery } from "@apollo/client"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import AddToList from "@/components/add-to-list/add-to-list"
import { useEffect, useState } from "react"

export const GET_ANIME = gql`
query($id: Int!) {
  Media(id: $id) {
    id
    idMal
    bannerImage
    format
    title {
      romaji
      english
    }  
    episodes
    coverImage {
      large
    }
    description
    genres
    status
    season
    seasonYear
  } 
}
`

export default function AnimeData() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [isAddToList, setIsAddToList] = useState<boolean>(false);

  const animeId = params.id as string;
  const router = useRouter();

  useEffect(() => {
    const addToList = searchParams.get('addToList');
    setIsAddToList(addToList === 'true');
  }, [searchParams]);

  const { loading, error, data, refetch } = useQuery(GET_ANIME, { 
      variables: { id: parseInt(animeId) },
      fetchPolicy: 'cache-first',
  });
  
  if (loading) return <AnimeDataSkeleton />
  if (error) return <Indicator onRetry={() => refetch()} type="error" message={error.message} />

  const anime: Anime = data?.Media;

  return (
      <AnimeLayout
          bannerImage={anime.bannerImage} 
          title={anime.title}
          router={router}
      >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                  <AnimeInfo 
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