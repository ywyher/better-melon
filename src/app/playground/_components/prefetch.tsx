import { usePrefetchEpisode } from "@/lib/hooks/use-prefetch-episode"

export default function PrefetchPlayground() {
  usePrefetchEpisode('9253', 1, 23, 'srt', true)
  
  return (
    <>
    </>
  )
}