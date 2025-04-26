"use client"

import { Suspense } from "react";
import AnimeFilters from "@/app/search/_components/filters";
import AnimeCard, { AnimeCardSkeleton } from "@/components/anime/anime-card";
import Header from "@/components/header";
import { Indicator } from "@/components/indicator";
import { Anime } from "@/types/anime";
import { gql, useQuery } from "@apollo/client"
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import { useState } from "react";

const GET_ANIMES = gql`
    query GetAnimes(
        $genres: [String], 
        $tags: [String], 
        $status: MediaStatus, 
        $seasonYear: Int, 
        $format: MediaFormat,
        $season: MediaSeason,
        $isAdult: Boolean,
        $source: MediaSource,
        $sort: [MediaSort] = [POPULARITY_DESC, SCORE_DESC],
        $countryOfOrigin: CountryCode,
        $averageScore: Int,
        $search: String
    ) {
        Page {
            pageInfo {
                hasNextPage
            }
            media (
                type: ANIME,
                sort: $sort,
                genre_in: $genres,
                tag_in: $tags,
                status: $status,
                seasonYear: $seasonYear,
                format: $format,
                season: $season,
                isAdult: $isAdult,
                source: $source,
                countryOfOrigin: $countryOfOrigin,
                averageScore: $averageScore,
                search: $search
            ) {
                id
                title {
                    english
                }
                genres
                tags {
                    name
                }
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

function SearchContent() {
    const [genres] = useQueryState('genres', parseAsArrayOf(parseAsString))
    const [tags] = useQueryState('tags', parseAsArrayOf(parseAsString))
    const [sort] = useQueryState('sort', parseAsArrayOf(parseAsString))

    const [status] = useQueryState('status')
    const [year] = useQueryState('year')
    const [format] = useQueryState('format')
    const [season] = useQueryState('season')
    const [isAdult] = useQueryState('isAdult')
    const [source] = useQueryState('source')
    const [country] = useQueryState('country')
    const [score] = useQueryState('score')
    
    const [query] = useQueryState('query')

    const [isLoading] = useState<boolean>(false)

    const { data, loading, error, refetch } = useQuery(GET_ANIMES, {
        variables: {
            genres: (genres && (genres?.length > 0)) ? genres : undefined,
            tags: (tags && (tags?.length > 0)) ? tags : undefined,
            sort: (sort && (sort?.length > 0)) ? sort : undefined,

            status: status || undefined,
            seasonYear: year ? parseInt(year) : undefined,
            format: format || undefined,
            season: season || undefined,
            isAdult: isAdult ? true : false || undefined,
            source: source || undefined,
            countryOfOrigin: country || undefined,
            score: score ? parseInt(score) : undefined,
            search: query || undefined,
        }
    });

    if (error)
      return (
          <Indicator message={error.message} type="error" onRetry={() => refetch()} />
      );

    return (
        <>
            <AnimeFilters refetch={refetch} />
            {(loading || isLoading) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                {[1, 2, 3, 4, 5, 6].map((_, idx) => (
                    <AnimeCardSkeleton key={idx} />
                ))}
                </div>
            )}

            {(data && data.Page.media && data.Page.media.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                {data.Page.media.map((anime: Anime) => (
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
    );
}

function SearchFallback() {
  return (
    <>
      <div className="animate-pulse p-4 rounded-lg border mb-6">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
          </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {[1, 2, 3, 4, 5, 6].map((_, idx) => (
              <AnimeCardSkeleton key={idx} />
          ))}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4">
          <Suspense fallback={<SearchFallback />}>
              <SearchContent />
          </Suspense>
      </div>
    </>
  );
}