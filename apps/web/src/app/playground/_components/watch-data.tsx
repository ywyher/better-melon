'use client'

import { useWatchData } from "@/lib/hooks/use-watch-data"

export default function WatchDataPlayground() {
  const {
    episode,
    errors,
    settings,
    duration,
    transcriptions,
    subtitles,
    loadStartTimeRef
  } = useWatchData('9253', 2)

  return <></>
}