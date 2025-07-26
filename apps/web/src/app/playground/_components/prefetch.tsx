import { usePrefetchEpisode } from "@/lib/hooks/use-prefetch-episode"

export default function PrefetchPlayground() {
  usePrefetchEpisode({
    animeId: '9253',
    episodeNumber: 1,
    episodesLength: 23,
    preferredFormat: 'srt',
  })
  
  return (
    <>
    </>
  )
}