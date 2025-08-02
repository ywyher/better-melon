"use client";

import { MediaPlayer, MediaPlayerInstance, MediaProvider } from '@vidstack/react';
import { DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import { handleHistory } from '@/lib/actions/history';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';
import LoadingButton from '@/components/loading-button';
import { useSaveProgress } from '@/lib/hooks/use-save-progress';
import { usePlayerStore } from '@/lib/stores/player-store';

export default function HistoryPlayground() {
  const player = useRef<MediaPlayerInstance>(null);
  const setPlayer = usePlayerStore((state) => state.setPlayer);
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setPlayer(player)
  }, [setPlayer]);
  
  const animeId = 20661;
  const episodeNumber = 5;
  const animeTitle = {
    english: "Terror in Resonance",
    romaji: "Zankyou no Terror",
    native: "残響のテロル",
  }
  const animeCoverImage = {
    medium: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/small/bx20661-aCR7QgzDfOSI.png",
    large: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20661-aCR7QgzDfOSI.png",
    extraLarge: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20661-aCR7QgzDfOSI.png",
  }
  const progress = 0;
  const duration = 1380;
  const videoSrc = "http://localhost:8080/proxy?url=https://cdn.dotstream.buzz/anime/bca82e41ee7b0833588399b1fcd177c7/06131c7fd7dda0c6681d6c55752143af/master.m3u8"

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const { error, message } = await handleHistory({ 
        data: {
          mediaCoverImage: animeCoverImage,
          mediaId: String(animeId),
          mediaTitle: animeTitle,
          mediaEpisode: episodeNumber,
          duration,
          progress
        }
      })

      if(error) throw new Error(error)
      toast.success(message)
    } catch(error) {
      const msg = error instanceof Error ? error.message : "Failed"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useSaveProgress({
    animeCoverImage,
    animeId,
    animeTitle,
    episodeNumber
  })

  return (
    <div className='flex flex-col gap-3'>
      <LoadingButton
        onClick={async () => handleSave()}
        isLoading={isLoading}
      >
        Save {animeTitle.english} in history
      </LoadingButton>
      <MediaPlayer
          title={animeTitle.english}
          ref={player}
          src={videoSrc}
          load='eager'
          posterLoad='eager'
          crossOrigin="anonymous"
          className='relative w-full h-fit'
          aspectRatio="16/9"
      >
          <MediaProvider>
          </MediaProvider>
          <DefaultAudioLayout icons={defaultLayoutIcons} />
          <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </div>
  )
}