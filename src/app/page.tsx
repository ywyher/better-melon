"use client";

import { useState } from "react";
import AnimeCard, { AnimeCardSkeleton } from "@/components/anime-card";
import { gql, useLazyQuery } from "@apollo/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "sonner";

// Define TypeScript interfaces for the anime data
interface AnimeTitle {
  romaji: string;
  english: string | null;
}

interface AnimeCoverImage {
  large: string;
  medium: string;
}

interface AnimeData {
  id: number;
  title: AnimeTitle;
  description: string | null;
  coverImage: AnimeCoverImage;
  bannerImage: string | null;
  episodes: number | null;
  season: string | null;
  seasonYear: number | null;
  averageScore: number | null;
  genres: string[];
  status: string;
}

interface PageData {
  media: AnimeData[];
}

const GET_ANIMES = gql`
  query ($search: String!) {
    Page {
      media(search: $search, type: ANIME, sort: [POPULARITY_DESC]) {
        id
        title {
          romaji
          english
        }
        description
        coverImage {
          large
          medium
        }
        bannerImage
        episodes
        season
        seasonYear
        averageScore
        genres
        status
      }
    }
  }
`;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [getAnime ,{ data, loading, error }] = useLazyQuery<{ Page: PageData }>(GET_ANIMES, {
    variables: {
      search: "",
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(!searchQuery) {
      console.log(searchQuery)
      toast.error('Search query cannot be empty!')
      return;
    }
    getAnime({ variables: {
      search: searchQuery,
      type: "ANIME"
    }});
  };

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-lg font-medium text-red-500">Error: {error.message}</p>
    </div>
  );

  const animes = data?.Page?.media || [];

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Anime Subtitles Lookup</h1>
        <form onSubmit={handleSearch} className="mb-8 flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search for anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <Button className="cursor-pointer">Search</Button>
        </form>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6].map((_, idx) => (
              <AnimeCardSkeleton key={idx} />
            ))}
          </div>
        ): (
          <>
            {animes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {animes.map(anime => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>          
            ): (
              <div className="text-center py-12">
                <p className="text-lg text-gray-500">No anime found. Try a different search term.</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}