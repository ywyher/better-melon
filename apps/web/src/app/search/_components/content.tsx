import AnimeCard from "@/components/anime/card/default/card";
import AnimeCardSkeleton from "@/components/anime/card/default/skeleton";
import { Anime } from "@/types/anime";

type SearchContentProps = {
  isLoading: boolean
  animes?: Anime[]
}

export default function SearchContent({ 
  isLoading,
  animes
}: SearchContentProps) {
  return (
    <>
      {isLoading && (
        <div className="
          grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-6 space-y-16
        ">
            {Array.from({ length: 10 }).map((_,idx) => <AnimeCardSkeleton key={idx} />)}
        </div>
      )}
      <div className="
          grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-6
      ">
        {animes?.map((anime: Anime) => (
          <AnimeCard
            key={anime.id} 
            id={anime.id}
            title={anime.title}
            coverImage={anime.coverImage}
            averageScore={anime.averageScore}
            status={anime.status}
            seasonYear={anime.seasonYear}
            format={anime.format}
          />
        ))}
      </div>

      {(!animes?.length && !isLoading) && <p>No animes found.</p>}
    </>
  )
}