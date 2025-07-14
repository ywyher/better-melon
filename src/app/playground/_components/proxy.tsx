"use client";

import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

const getUrl = (url: string, proxy: boolean = true) => {
  const proxyUrl = 'http://localhost:9090/proxy'
  if(proxy) {
    return `${proxyUrl}?url=${url}`
  }

  return url;
}

export default function ProxyPlayground() {
  const videoSrc = "https://mistyvalley31.live/_v7/c0f408592974ff88b0945347b123f213ffecf702660d16825b811ab131dd02b4716baf7de49b74226ddbc9ae2fe95a37db65c002e14768d6121690460c21d63199f686be6473780775750ae7880e89991e62e2a2cc571eb5666264d5554a1550f8bf7c073e112ae080f09ca935b92b87902947e670e996a7045d7a97db46a264/master.m3u8"
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