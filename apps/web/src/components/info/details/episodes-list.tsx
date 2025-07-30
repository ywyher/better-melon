import EpisodesList from "@/components/episodes-list/episodes-list";
import { AnimeDetails } from "@/types/anime";

export default function DetailsEpisodesList({ anime }: { anime: AnimeDetails }) {
  return <EpisodesList 
    animeBanner={anime.bannerImage}
    animeTitle={anime.title}
    nextAiringEpisode={anime.nextAiringEpisode}
    className="p-0 m-0 border-0 shadow-none max-h-[50vh]"
  />
}