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
import { useWatchDataStore } from "@/lib/stores/watch-store";
import { hasChanged } from "@/lib/utils/utils";
import { usePitchAccentChunks } from "@/lib/hooks/use-pitch-accent-chunks";

export default function DefinitionPlayerPlayground() {
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

  const { transcriptions, transcriptionsLookup } = useSubtitleTranscriptions()
  const { styles } = useSubtitleStyles();
  const {
    setTranscriptions,
    setStyles,
    setTranscriptionsLookup,
  } = useWatchDataStore()
  const store = useWatchDataStore.getState()

  useEffect(() => {
    console.log(`transcriptions waiting`)
    if (transcriptions && hasChanged(transcriptions, store.transcriptions)) {
      console.log(`transcriptions passed`)
      setTranscriptions(transcriptions);
    }
  }, [transcriptions]);

  useEffect(() => {
    console.log(`transcriptinsLookup waiting`)
    if (transcriptionsLookup && hasChanged(transcriptionsLookup, store.transcriptionsLookup)) {
      console.log(`transcriptinsLookup passed`)
      setTranscriptionsLookup(transcriptionsLookup);
    }
  }, [transcriptionsLookup]);

  useEffect(() => {
    console.log(`styles waiting`)
    if (styles && hasChanged(styles, store.styles)) {
      console.log(`styles passed`)
      setStyles(styles);
    }
  }, [styles]);
  
  const url = "https://www.youtube.com/watch?v=0ZCsS_bOJgw"

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
        <SubtitleTranscriptions />
    </MediaPlayer>
  );
}