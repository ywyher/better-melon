import { deleteFromHistory, saveInHistory } from "@/lib/actions/history"
import { History } from "@/lib/db/schema"
import { useState } from "react"

type HandleSaveProps = {
  animeCoverImage: History['animeCoverImage']
  animeId: History['animeId']
  animeTitle: History['animeTitle']
  animeEpisode: History['animeEpisode']
  duration: History['duration']
  progress: History['progress']
}

type HandleDeleteProps = {
  animeId: History['animeId']
  animeEpisode: History['animeEpisode']
}

export default function useHistory() {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleSave = async ({
    duration,
    animeCoverImage,
    animeEpisode,
    animeId,
    animeTitle,
    progress,
  }: HandleSaveProps) => {
    setIsLoading(true)

    try {
      const { error, message } = await saveInHistory({ 
        data: {
          animeCoverImage,
          animeId: String(animeId),
          animeTitle,
          animeEpisode,
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
    animeEpisode,
    animeId,
  }: HandleDeleteProps) => {
    setIsLoading(true)

    try {
      const { error, message } = await deleteFromHistory({ 
        animeId: String(animeId),
        animeEpisode,
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