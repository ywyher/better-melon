import { getCacheKeys } from "@/lib/db/queries"
import { Anime } from "@/types/anime"
import { CachedFiles } from "@/types/subtitle"
import { useEffect, useState } from "react"

type UseIsTranscriptionsCachedProps = {
  animeId: Anime['id'],
  episodeNumber: number
}

export default function useIsTranscriptionsCached({ animeId, episodeNumber }: UseIsTranscriptionsCachedProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isCached, setIsCached] = useState<boolean>(false)
  const [cachedFiles, setCachedFiles] = useState<CachedFiles>({
    japanese: null,
    english: null
  })

  const extractFilename = (url: string): string => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const filename = pathname.split('/').pop() || ''
      return decodeURIComponent(filename)
    } catch {
      // If URL parsing fails, try to extract from the end of the string
      const parts = url.split('/')
      return decodeURIComponent(parts[parts.length - 1] || '')
    }
  }

  useEffect(() => {
    (async () => {
      setIsLoading(true)

      const regex = /jimaku.cc/i;
      const keys = await getCacheKeys(`subtitle:${animeId}:${episodeNumber}:*`);
      const [japaneseKey] = keys.filter(k => regex.test(k))
      const [englishKey] = keys.filter(k => !regex.test(k))

      if (japaneseKey && englishKey) {
        setIsCached(true)
        
        // Extract URLs from cache keys (everything after the third colon)
        const japaneseUrl = japaneseKey.split(':').slice(3).join(':')
        const englishUrl = englishKey.split(':').slice(3).join(':')
        
        const japaneseFilename = extractFilename(japaneseUrl)
        
        setCachedFiles({
          // saving the name since the user can upload a local file, then we won't have the url
          japanese: japaneseFilename,
          // saving the url since the user can't upload a local version
          english: englishUrl
        })
      }

      setIsLoading(false)
    })()
  }, [animeId, episodeNumber])

  return {
    isLoading,
    isCached,
    cachedFiles
  }
}