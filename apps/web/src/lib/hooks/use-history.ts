import { handleHistory } from "@/lib/actions/history"
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
      const { error, message } = await handleHistory({ 
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
        error
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    handleSave
  }
}