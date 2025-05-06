'use client'

import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

export default function PlayerPlayground() {
  return( 
    <MediaPlayer
      title={"asd"}
      src={"http://localhost:2000/proxy?url=https://lightningspark77.pro/_v7/b145d2374990ae1c6729b473457964247200b0c4dfc266cd896c13c16c62b0176c9ddc773b9ab8e9957c6579e5ef9fbc10c92eb2275126f9dfabd86d42fdf73dd879b9a87ced51fc2c6b8bb389fb2d1c2b0405a67f28128f230594972df9cb66945a5f8f51629dbade11b96c674a291037a95b568ad1a2c6d896d45252b299be/master.m3u8"}
      load='eager'
    >
      <MediaProvider>
      </MediaProvider>
      <DefaultAudioLayout icons={defaultLayoutIcons} />
      <DefaultVideoLayout
          // thumbnails={`https://files.vidstack.io/sprite-fight/thumbnails.vtt`}
          icons={defaultLayoutIcons} 
      />
    </MediaPlayer>
  )
}