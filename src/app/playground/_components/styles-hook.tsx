'use client'

import SubtitleTranscriptions from "@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions"
import SubtitleStyles from "@/components/subtitle/styles/subtitle-styles"
import { useSubtitleStyles } from "@/lib/hooks/use-subtitle-styles"
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions"
import { usePlayerStore } from "@/lib/stores/player-store"
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store"
import { useEffect } from "react"

export default function StylesHook() {
  const setEnglishSubtitleUrl = usePlayerStore((state) => state.setEnglishSubtitleUrl) || "";
  const setActiveSubtitleFile = usePlayerStore((state) => state.setActiveSubtitleFile);
  const setActiveTranscriptions = usePlayerStore((state) => state.setActiveTranscriptions) || [];

  useEffect(() => {
    setActiveSubtitleFile({
      source: 'remote',
      file: {
        url: 'https://jimaku.cc/entry/1310/download/%5BJudas%5D%20Steins%3BGate%20-%20S01E01.srt',
        name: 'steins;gate',
        last_modified: new Date(),
        size: 1220,
      }
    });
    setActiveTranscriptions(['japanese', 'romaji'])
  }, [setActiveSubtitleFile, setActiveTranscriptions, setEnglishSubtitleUrl])

  const stylesStore = useSubtitleStylesStore((state) => state.styles)

  const { 
    transcriptions, 
    isLoading: isTranscriptionsLoading, 
    loadingDuration: transcriptionsLoadingDuration,
  } = useSubtitleTranscriptions();
  
  const {
     styles,
     isLoading,
     loadingDuration
  } = useSubtitleStyles()

  useEffect(() => {
    console.log(`styles`, {
      styles,
      isLoading,
      loadingDuration,
      stylesStore
    })
  }, [styles, isLoading, loadingDuration, stylesStore])

  useEffect(() => {
    console.log(`transcriptions`, {
      transcriptions,
      isTranscriptionsLoading,
      transcriptionsLoadingDuration,
    })
  }, [isTranscriptionsLoading, transcriptionsLoadingDuration, transcriptions])

  return (
    <div className="relative h-screen w-screen flex justify-center items-center">
      <SubtitleStyles source='store' />
      <SubtitleTranscriptions 
        transcriptions={transcriptions}
        styles={styles}
        syncPlayerSettings="ask"
      />
    </div>
  )
}