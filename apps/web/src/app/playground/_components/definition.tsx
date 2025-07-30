'use client'

import { useEffect } from "react";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { useInitializeTokenizer } from "@/lib/hooks/use-initialize-tokenizer";
import SubtitleTranscriptions from "@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions";
import { useWatchDataStore } from "@/lib/stores/watch-store";
import { hasChanged } from "@/lib/utils/utils";
import { useSubtitleStyles } from "@/lib/hooks/use-subtitle-styles";
import { usePitchAccentChunks } from "@/lib/hooks/use-pitch-accent-chunks";

import DefinitionCard from "@/components/definition-card/definition-card";

export default function DefinitionPlayground() {
  const setActiveSubtitleFile = useSubtitleStore((state) => state.setActiveSubtitleFile);
  const setActiveTranscriptions = useSubtitleStore((state) => state.setActiveTranscriptions);
  const setEnglishSubtitleUrl = useSubtitleStore((state) => state.setEnglishSubtitleUrl);

  useEffect(() => {
    setActiveTranscriptions(['hiragana', 'japanese']);
    setActiveSubtitleFile({
      file: {
        last_modified: "2024-04-28T16:23:56.084911647Z",
        name: "[Judas] Steins;Gate - S01E02.srt",
        size: 36924,
        url: "https://jimaku.cc/entry/1323/download/%5BMoozzi2%5D%20Made%20in%20Abyss%20-%2009%20(BD%201920x1080%20x.264%20Flac).ass"
      },
      source: 'remote'
    });
    setEnglishSubtitleUrl("https://megacloudforest.xyz/subtitle/92580649ff01096b4a0de6428f58bedb/eng-0.vtt")
  }, [setEnglishSubtitleUrl, setActiveTranscriptions, setActiveSubtitleFile]);

  const { isInitialized } = useInitializeTokenizer()
  const { transcriptions, transcriptionsLookup } = useSubtitleTranscriptions(isInitialized)
  const { styles } = useSubtitleStyles() 
  const { 
    pitchLookup,
  } = usePitchAccentChunks({
    animeId: '9253',
    japaneseCues: transcriptions?.find(t => t.transcription == 'japanese')?.cues || [],
    shouldFetch: true
  })

  const setStyles = useWatchDataStore((state) => state.setStyles)
  const setTranscriptions = useWatchDataStore((state) => state.setTranscriptions)
  const setPitchLookup = useWatchDataStore((state) => state.setPitchLookup)
  const setTranscriptionsLookup = useWatchDataStore((state) => state.setTranscriptionsLookup)
  const store = useWatchDataStore.getState(); // use this to read current store values (won't trigger re-renders)

  useEffect(() => {
    if (transcriptionsLookup && hasChanged(transcriptionsLookup, store.transcriptionsLookup)) {
      console.log(`[TranscriptionsLookup]`, transcriptionsLookup)
      setTranscriptionsLookup(transcriptionsLookup);
    }
  }, [pitchLookup]);
  useEffect(() => {
    if (pitchLookup && hasChanged(pitchLookup, store.pitchLookup)) {
      console.log(`[PitchLookup]`, pitchLookup)
      setPitchLookup(pitchLookup);
    }
  }, [pitchLookup]);
  useEffect(() => {
    if (styles && hasChanged(styles, store.styles)) {
      console.log(`[Styles]`, styles)
      setStyles(styles);
    }
  }, [styles]);
  useEffect(() => {
    if (transcriptions && hasChanged(transcriptions, store.transcriptions)) {
      setTranscriptions(transcriptions);
    }
  }, [transcriptions]);

  return (
    <>
      <DefinitionCard />
      <SubtitleTranscriptions />
    </>
  )
}