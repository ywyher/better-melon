"use client";

import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import { DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { AnimeDetails } from "@/types/anime"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from 'lucide-react';

type DetailsTrailerProps = {
  anime: AnimeDetails
}

export default function DetailsTrailer({ anime }: DetailsTrailerProps) {
  return (
    <>
      {anime.trailer ? (
        <MediaPlayer
          title={anime.title.english}
          src={`${anime.trailer.site}/${anime.trailer.id}`}
          muted
          load='eager'
          posterLoad='eager'
          crossOrigin="anonymous"
          className='relative w-full h-fit'
          aspectRatio="16/9"
        >
          <MediaProvider>
            <Poster
              className="vds-poster"
              src={anime.trailer.thumbnail}
              alt={anime.title.english}
            />
          </MediaProvider>
          <DefaultAudioLayout icons={defaultLayoutIcons} />
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
      ): (
        <Alert 
          variant="destructive"
          className="bg-secondary"
        >
          <Info />
          <AlertTitle>No trailer found for this anime</AlertTitle>
          <AlertDescription>
            You can add components and dependencies to your app using the cli.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}