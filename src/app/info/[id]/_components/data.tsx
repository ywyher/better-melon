// AnimeData.tsx
"use client"
import { AnimeDescription } from "@/app/info/[id]/_components/description"
import { AnimeEpisodes } from "@/app/info/[id]/_components/episodes"
import { AnimeError } from "@/app/info/[id]/_components/error"
import { AnimeInfo } from "@/app/info/[id]/_components/info"
import { AnimeLayout } from "@/app/info/[id]/_components/layout"
import { AnimeDataSkeleton } from "@/app/info/[id]/_components/skeleton"
import { Anime } from "@/app/info/[id]/types"
import { gql, useQuery } from "@apollo/client"
import { useRouter } from "next/navigation"

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

export default function AnimeData({ id }: { id: string }) {
    const { loading, error, data } = useQuery(GET_ANIME, { variables: { id: parseInt(id) } })
    const router = useRouter()
    
    if (loading) return <AnimeDataSkeleton />
    if (error) return <AnimeError error={error} />

    const anime: Anime = data?.Media
    const episodesArray = Array.from({ length: anime.episodes || 0 }, (_, i) => i + 1)

    return (
        <AnimeLayout
            bannerImage={anime.bannerImage} 
            title={anime.title.romaji}
            router={router}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cover Image and Info */}
                <div className="md:col-span-1">
                    <AnimeInfo 
                        coverImage={anime.coverImage?.large} 
                        title={anime.title.romaji}
                        format={anime.format}
                        status={anime.status}
                        season={anime.season}
                        seasonYear={anime.seasonYear}
                        genres={anime.genres}
                    />
                </div>
                
                {/* Title, Description and Episodes */}
                <div className="flex flex-col gap-6 md:col-span-2">
                  <AnimeEpisodes 
                      episodes={episodesArray}
                      animeId={id}
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