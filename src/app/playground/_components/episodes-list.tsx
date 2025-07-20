import EpisodesList from "@/components/episodes-list/episodes-list";

export default function EpisodesListPlayground() {
  return (
    <EpisodesList
      animeTitle={{
        english: "naruto"
      }}
      animeBanner={"https://s4.anilist.co/file/anilistcdn/media/anime/banner/20-HHxhPj5JD13a.jpg"}
      className="max-w-[600px]"
    />
  )
}