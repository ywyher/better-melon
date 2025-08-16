'use client'

import LoadingButton from "@/components/loading-button"
import useHistory from "@/lib/hooks/use-history"
import { useAnimeHistory } from "@/lib/hooks/use-anime-history"
import { usePlayerStore } from "@/lib/stores/player-store"
import { useStreamingStore } from "@/lib/stores/streaming-store"
import { useMediaState } from "@vidstack/react"
import { Bookmark } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

export default function EpisodeDetailsHistory() {
  const [isLocalLoading, setIsLocalLoading] = useState(false)
  const animeId = useStreamingStore((state) => state.animeId) || 20661 
  const episodeNumber = useStreamingStore((state) => state.episodeNumber)
  const streamingData = useStreamingStore((state) => state.streamingData)
  const player = usePlayerStore((state) => state.player)
  const duration = useMediaState('duration', player)

  const { handleSave, handleDelete, isLoading: isHistoryLoading } = useHistory()

  const { animeHistory, isLoading: isAnimeHistoryLoading, refetch } = useAnimeHistory({
    animeId: animeId,
    animeEpisode: episodeNumber
  })

  const handleSaveInHistory = async () => {
    if(!streamingData) return; 
    if(!duration) return toast.error("Player instance not found")
    setIsLocalLoading(true)
  
    try {
      const { error, message } = await handleSave({
        animeId: String(animeId),
        animeEpisode: episodeNumber,
        animeCoverImage: streamingData?.anime.coverImage,
        animeTitle: streamingData?.anime.title,
        duration,
        progress: duration,
      })
      if(error) throw new Error(error)
      toast.success(message)
      refetch()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to save in history'
      toast.error(msg)
    } finally {
      setIsLocalLoading(false)
    }
  }

  const handleDeleteFromHistory = async () => {
    setIsLocalLoading(true)
    try {
      const { error, message } = await handleDelete({
        animeId: String(animeId),
        animeEpisode: episodeNumber,
      })
      if(error) throw new Error(error)
      toast.success(message)
      refetch()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to save in history'
      toast.error(msg)
    } finally {
      setIsLocalLoading(false)
    }
  }

  const isLoading = useMemo(() => {
    return isHistoryLoading || isAnimeHistoryLoading || isLocalLoading
  }, [isHistoryLoading, isAnimeHistoryLoading, isLocalLoading])

  return (
    <LoadingButton
      onClick={animeHistory ? handleDeleteFromHistory : handleSaveInHistory}
      isLoading={isLoading}
      className="py-0"
      variant="outline"
    >
      <Bookmark />
      {animeHistory ? <>Remove from history</> : <>Mard as watched</>}
    </LoadingButton>
  )
}