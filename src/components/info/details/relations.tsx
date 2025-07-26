import AnimeCard from "@/components/anime/anime-card/anime-card"
import { Anime } from "@/types/anime"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { excludeRelations } from "@/lib/constants/anime"
import { AlertCircle } from "lucide-react"

type DetailsRelationsProps = {
  anime: Anime
}

export default function DetailsRelations({ anime }: DetailsRelationsProps) {
  return (
    <div className="flex flex-col gap-5">
      <Alert variant="destructive" className="bg-secondary">
        <AlertCircle />
        <AlertDescription className="font-bold">
          This page exclude relations that aren't anime like manage, novels and so on
        </AlertDescription>
      </Alert>
      <div className="
        grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
        gap-4 md:gap-5 items-center justify-center
      ">        
      {anime.relations.edges.filter(e => !excludeRelations.includes(e.relationType)).map((e) => (
          <AnimeCard
            key={e.node.id}
            id={e.node.id}
            title={e.node.title}
            format={e.node.format}
            status={e.node.status}
            coverImage={e.node.coverImage}
            averageScore={0}
            seasonYear={0}
            relationType={e.relationType}
          />
        ))}
      </div>
    </div>
  )
}