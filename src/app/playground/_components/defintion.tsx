'use client'

import SubtitleTranscriptions from "@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions";
import DefinitionCard from "@/components/definition-card/definition-card";
import { useSubtitleStyles } from "@/lib/hooks/use-subtitle-styles";
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { useEffect } from "react";

import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useSubtitleStore } from "@/lib/stores/subtitle-store";

export default function DefinitionPlayground() {
  const setActiveSubtitleFile = useSubtitleStore((state) => state.setActiveSubtitleFile);
  const setActiveTranscriptions = useSubtitleStore((state) => state.setActiveTranscriptions);
  const setEnglishSubtitleUrl = useSubtitleStore((state) => state.setEnglishSubtitleUrl);
  const sentences = useDefinitionStore((state) => state.sentences)
  
  useEffect(() => {
    setEnglishSubtitleUrl("https://s.megastatics.com/subtitle/92580649ff01096b4a0de6428f58bedb/eng-0.vtt");
    setActiveTranscriptions(['japanese', 'english']);
    setActiveSubtitleFile({
      file: {
        last_modified: "2024-04-28T16:23:56.084911647Z",
        name: "[Judas] Steins;Gate - S01E02.srt",
        size: 36924,
        url: "https://jimaku.cc/entry/1310/download/%5BJudas%5D%20Steins%3BGate%20-%20S01E02.srt"
      },
      source: 'remote'
    });
  }, [setEnglishSubtitleUrl, setActiveTranscriptions, setActiveSubtitleFile]);

  useEffect(() => {
    console.log(`sentences`, sentences)
  }, [sentences])
  
  const { transcriptions, transcriptionsLookup } = useSubtitleTranscriptions()
  const { styles } = useSubtitleStyles();

  const url = "http://localhost:8080/proxy?url=https://frostywinds57.live/_v7/af9590f35dc83df1743cb7a42fb27e1d774d69d735058842262eaa1a8448ee6af7ae3b241bcdc0fc8fd10155d82c5fcfa232daf76ee0a09aca6a64dfd264b7d9fa2517256de0b588c790ece83c7d98040c9b1b333bbd82044ca5bcc4b6140661a653aaeac58ca922caf3a87efc10d31729f04a8135742dac190b80c13050b903/master.m3u8"

  return (
    <MediaPlayer
        title={""}
        src={url}
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
            icons={defaultLayoutIcons} 
        />
        <DefinitionCard />
        <SubtitleTranscriptions
          transcriptions={transcriptions}
          styles={styles}
          syncPlayerSettings={'always'}
          cuePauseDuration={0}
          definitionTrigger={'click'}
          transcriptionsLookup={transcriptionsLookup}
        />
    </MediaPlayer>
  );
}