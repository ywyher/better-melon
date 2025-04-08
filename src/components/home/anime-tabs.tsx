"use client";

import { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import AnimeCard, { AnimeCardSkeleton } from "@/components/anime/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Anime } from "@/types/anime";

const GET_ANIMES = gql`
  query {
    popular: Page(page: 1, perPage: 24) {
      media(sort: POPULARITY_DESC, type: ANIME) {
        id
        title {
          english
        }
        genres
        status
        coverImage {
          large
        }
        season
        seasonYear
        popularity
        episodes
        description
        averageScore
      }
    }
    newest: Page(page: 1, perPage: 24) {
      media(sort: START_DATE_DESC, type: ANIME) {
        id
        title {
          english
        }
        genres
        status
        coverImage {
          large
        }
        season
        seasonYear
        popularity
        episodes
        description
        averageScore
      }
    }
    topRated: Page(page: 1, perPage: 24) {
      media(sort: SCORE_DESC, type: ANIME) {
        id
        title {
          english
        }
        genres
        status
        coverImage {
          large
        }
        season
        seasonYear
        popularity
        episodes
        description
        averageScore
      }
    }
    topAiring: Page(page: 1, perPage: 24) {
      media(sort: SCORE_DESC, type: ANIME, status: RELEASING) {
        id
        title {
          english
        }
        genres
        status
        coverImage {
          large
        }
        season
        seasonYear
        popularity
        episodes
        description
        averageScore
      }
    }
  }
`;

export default function AnimeTabs() {
  const { data, loading, error } = useQuery(GET_ANIMES);
  const [tab, setTab] = useState("popular");

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-medium text-red-500">Error: {error.message}</p>
      </div>
    );

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="flex justify-center gap-4 w-full">
        <TabsTrigger className="cursor-pointer" value="popular">Popular</TabsTrigger>
        <TabsTrigger className="cursor-pointer" value="newest">Newest</TabsTrigger>
        <TabsTrigger className="cursor-pointer" value="topRated">Top Rated</TabsTrigger>
        <TabsTrigger className="cursor-pointer" value="topAiring">Top Airing</TabsTrigger>
      </TabsList>

      {["popular", "newest", "topRated", "topAiring"].map((category) => (
        <TabsContent key={category} value={category}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {[...Array(24)].map((_, idx) => (
                <AnimeCardSkeleton key={idx} />
              ))}
            </div>
          ) : (
            <>
              {data?.[category]?.media?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                  {data[category].media.map((anime: Anime) => (
                    <AnimeCard
                      key={anime.id}
                      id={anime.id}
                      title={anime.title}
                      coverImage={anime.coverImage}
                      averageScore={anime.averageScore}
                      status={anime.status}
                      genres={anime.genres}
                      description={anime.description}
                      episodes={anime.episodes}
                      season={anime.season}
                      seasonYear={anime.seasonYear}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-500">
                    No anime found. Try a different search query.
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}