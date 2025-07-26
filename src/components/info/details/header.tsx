import { Anime, AnimeTitle } from "@/types/anime"

type DetailsHeaderProps = {
  title: AnimeTitle
}

export default function DetailsHeader({
  title
}: DetailsHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold">Details</h1>
      <div className="text-muted-foreground">Explore more about {title.english}</div>
    </div>
  )
}