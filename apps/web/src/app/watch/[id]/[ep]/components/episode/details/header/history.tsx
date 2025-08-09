'use client'

import LoadingButton from "@/components/loading-button"
import useHistory from "@/lib/hooks/use-history"
import { useMediaHistory } from "@/lib/hooks/use-media-history"
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

  const { mediaHistory, isLoading: isMediaHistoryLoading, refetch } = useMediaHistory({
    mediaId: animeId,
    mediaEpisode: episodeNumber
  })

  const handleSaveInHistory = async () => {
    if(!streamingData) return; 
    if(!duration) return toast.error("Player instance not found")
    setIsLocalLoading(true)
  
    try {
      const { error, message } = await handleSave({
        mediaId: String(animeId),
        mediaEpisode: episodeNumber,
        mediaCoverImage: streamingData?.anime.coverImage,
        mediaTitle: streamingData?.anime.title,
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
        mediaId: String(animeId),
        mediaEpisode: episodeNumber,
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
    return isHistoryLoading || isMediaHistoryLoading || isLocalLoading
  }, [isHistoryLoading, isMediaHistoryLoading, isLocalLoading])

  return (
    <LoadingButton
      onClick={mediaHistory ? handleDeleteFromHistory : handleSaveInHistory}
      isLoading={isLoading}
      className="py-0"
      variant="outline"
    >
      <Bookmark />
      {mediaHistory ? <>Remove from history</> : <>Mard as watched</>}
    </LoadingButton>
  )
}