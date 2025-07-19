import DetailsHeader from "@/components/info/details/header";
import DetailsTabs from "@/components/info/details/tabs";
import { Anime } from "@/types/anime";

type DetailsProps = {
  anime: Anime
  isLoading: boolean
}

export default function Details({ anime, isLoading }: DetailsProps) {
  if(isLoading) return <>Loading</>
  
  return (
    <div className="flex flex-col gap-5">
      <DetailsHeader
        title={anime.title}
      />
      <DetailsTabs anime={anime} />
    </div>
  )
}