import AnimeInfo from "@/app/info/[id]/_components/info"
import { Anime } from "@/types/anime";

type Params = Promise<{ id: Anime['id'] }>

export default async function AnimeData({ params }: { params: Params }) {
  const { id } = await params;

  return (
    <AnimeInfo
      animeId={id}
    />
  )
}