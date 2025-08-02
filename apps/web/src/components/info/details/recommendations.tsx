import AnimeCard from "@/components/anime/card/default/card"
import { AnimeDetails } from "@/types/anime"

type DetailsRecommendationsProps = {
  anime: AnimeDetails
}

export default function DetailsRecommendations({ anime }: DetailsRecommendationsProps) {
  return (
    <div className="
      grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4
      gap-4 md:gap-5 items-center justify-center
    ">        
      {anime.recommendations.edges.map((e) => (
        <AnimeCard
          key={e.node.mediaRecommendation.id}
          id={e.node.mediaRecommendation.id}
          title={e.node.mediaRecommendation.title}
          format={e.node.mediaRecommendation.format}
          status={e.node.mediaRecommendation.status}
          coverImage={e.node.mediaRecommendation.coverImage}
          averageScore={e.node.mediaRecommendation.averageScore}
          seasonYear={e.node.mediaRecommendation.seasonYear}
        />
      ))}
    </div>
  )
}