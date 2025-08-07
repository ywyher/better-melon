import { deleteFromHistory, saveInHistory } from "@/lib/actions/history"
import { History } from "@/lib/db/schema"
import { useState } from "react"

type HandleSaveProps = {
  mediaCoverImage: History['mediaCoverImage']
  mediaId: History['mediaId']
  mediaTitle: History['mediaTitle']
  mediaEpisode: History['mediaEpisode']
  duration: History['duration']
  progress: History['progress']
}

type HandleDeleteProps = {
  mediaId: History['mediaId']
  mediaEpisode: History['mediaEpisode']
}

export default function useHistory() {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleSave = async ({
    duration,
    mediaCoverImage,
    mediaEpisode,
    mediaId,
    mediaTitle,
    progress,
  }: HandleSaveProps) => {
    setIsLoading(true)

    try {
      const { error, message } = await saveInHistory({ 
        data: {
          mediaCoverImage,
          mediaId: String(mediaId),
          mediaTitle,
          mediaEpisode,
          duration,
          progress
        }
      })

      if(error) throw new Error(error)

      return {
        message,
        error: null
      }
    } catch(error) {
      const msg = error instanceof Error ? error.message : "Failed"
      return {
        message: null,
        error: msg
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async ({
    mediaEpisode,
    mediaId,
  }: HandleDeleteProps) => {
    setIsLoading(true)

    try {
      const { error, message } = await deleteFromHistory({ 
        mediaId: String(mediaId),
        mediaEpisode,
      })

      if(error) throw new Error(error)

      return {
        message,
        error: null
      }
    } catch(error) {
      const msg = error instanceof Error ? error.message : "Failed"
      return {
        message: null,
        error: msg
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    handleSave,
    handleDelete
  }
}