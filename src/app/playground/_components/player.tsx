'use client'

import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

export default function PlayerPlayground() {
  return( 
    <MediaPlayer
      title={"asd"}
      // steins;gate 3
      src="http://localhost:9696/proxy?url=https://lightningflash39.live/_v7/79d995d8bd1caa27f33c40d08437fcf6db5e6443150bb6402cd390a12ee72cd648b19f97ecf031542dcf3ca15f34dbc74d2700c801275164b6c6d54cd5d6f9cbc5ea3609c9298a68ccdd78a8e3b2ba7b7c554551bab7101f74329928d9b492982a4f6c79a35437002a630336b7d75f1d3228914b2a220aea873463265f098991/master.m3u8"
      // erased 2
      // src="http://localhost:9696/proxy?url=https://lightningflash39.live/_v7/2b2041af83e1c4c1a4b9ff18320b4f1c87bcf76eef1053e09a8dac264f3943929b13a9c982677826ea4eb7df02bd7be53c9a934d147e6d82629cedb23b28fe19e2ce82d05770679305fc040d02fd6dc101d174ded5b1003c37759a7dfd1af70fee5394454ba331385386e7d4d2fb05d235b28e935bb591d5046ed179b6616aa0/master.m3u8"
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