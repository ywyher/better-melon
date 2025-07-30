import EpisodesList from "@/components/episodes-list/episodes-list";

export default function EpisodesListPlayground() {
  return (
    <EpisodesList
      nextAiringEpisode={{
        episode: 4,
        timeUntilAiring: 372341
      }}
      animeTitle={{
        english: "DAN DA DAN Season 2"
      }}
      animeBanner="https://s4.anilist.co/file/anilistcdn/media/anime/banner/185660-NdXFgzcYmcDz.jpg"   
      className="max-w-[600px]"
    />
  )
}