"use client";

import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

const getUrl = (url: string, proxy: boolean = true) => {
  const proxyUrl = 'http://localhost:8080/proxy'
  if(proxy) {
    return `${proxyUrl}?url=${url}`
  }

  return url;
}

export default function ProxyPlayground() {
  const videoSrc = "https://cdn.dotstream.buzz/anime/eccbc87e4b5ce2fe28308fd9f2a7baf3/98960e8859d29683ad5984c4bae288af/master.m3u8"
  const thumbnails = "https://megacloudforest.xyz/thumbnails/ea3130d664219f27df26ee86320a5c51/thumbnails.vtt"

  return (
    <div className='flex flex-col gap-3'>
      <MediaPlayer
          title={"Proxy"}
          src={getUrl(videoSrc)}
          load='eager'
          posterLoad='eager'
          crossOrigin="anonymous"
          className='relative w-full h-fit'
          aspectRatio="16/9"
      >
          <MediaProvider>
          </MediaProvider>
          <DefaultAudioLayout icons={defaultLayoutIcons} />
          <DefaultVideoLayout
              thumbnails={getUrl(thumbnails)}
              icons={defaultLayoutIcons} 
          />
      </MediaPlayer>
    </div>
  )
}