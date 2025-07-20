import EpisodesList from "@/components/episodes-list/episodes-list";
import { Anime } from "@/types/anime";

export default function DetailsEpisodesList({ anime }: { anime: Anime }) {
  return <EpisodesList 
    animeBanner={anime.bannerImage}
    animeTitle={anime.title}
    className="p-0 m-0 border-0 shadow-none max-h-[50vh]"
  />
}