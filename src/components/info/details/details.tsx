import EpisodesList from "@/components/episodes-list/episodes-list";
import DetailsHeader from "@/components/info/details/header";
import DetailsSkeleton from "@/components/info/details/skeleton";
import DetailsTabs from "@/components/info/details/tabs";
import { Anime } from "@/types/anime";

type DetailsProps = {
  anime: Anime
  isLoading: boolean
}

export default function Details({ anime, isLoading }: DetailsProps) {
  if(isLoading) return <DetailsSkeleton className="max-h-[80vh]" />
  
  return (
    <div className="flex flex-col gap-5 pb-10">
      <DetailsHeader
        title={anime.title}
      />
      <div className="flex flex-col xl:flex-row justify-between gap-5">
        <div className="flex-1 max-h-[80vh]">
          <DetailsTabs anime={anime} />
        </div>
        <div className="hidden xl:block  max-w-full xl:max-w-[500px] h-[80vh]">
          <EpisodesList
            nextAiringEpisode={anime.nextAiringEpisode}
            animeBanner={anime.bannerImage}
            animeTitle={anime.title}
            className="h-full"
          />
        </div>
      </div>
    </div>
  )
}