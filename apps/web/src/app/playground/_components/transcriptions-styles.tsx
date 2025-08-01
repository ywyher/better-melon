'use client'

import SubtitleTranscriptions from "@/app/watch/[id]/[ep]/components/transcriptions/transcriptions";
import DefinitionCard from "@/components/definition-card/definition-card";
import { useEffect } from "react";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { useInitializeTokenizer } from "@/lib/hooks/use-initialize-tokenizer";
import { hasChanged } from "@/lib/utils/utils";
import { useSubtitleStyles } from "@/lib/hooks/use-subtitle-styles";
import { useTranscriptionStore } from "@/lib/stores/transcription-store";
import { Button } from "@/components/ui/button";
import SettingsDialog from "@/app/watch/[id]/[ep]/components/settings/settings-dialog";

export default function TranscriptionsStylesPlayground() {
  const setActiveSubtitleFile = useSubtitleStore((state) => state.setActiveSubtitleFile);
  const setEnglishSubtitleUrl = useSubtitleStore((state) => state.setEnglishSubtitleUrl);
  const setActiveTranscriptions = useTranscriptionStore((state) => state.setActiveTranscriptions);

  useEffect(() => {
    setActiveTranscriptions(['japanese', 'hiragana', 'english']);
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

  const { isInitialized } = useInitializeTokenizer({ shouldInitialize: true })
  const { transcriptions } = useSubtitleTranscriptions({
    shouldFetch: isInitialized,
    animeId: 9253,
    episodeNumber: 2
  })
  const { rawStyles, computedStyles, refetch: refetchStyles } = useSubtitleStyles() 

  const setTranscriptions = useTranscriptionStore((state) => state.setTranscriptions)
  const store = useTranscriptionStore.getState(); // use this to read current store values (won't trigger re-renders)

  useEffect(() => {
    if (transcriptions && hasChanged(transcriptions, store.transcriptions)) {
      setTranscriptions(transcriptions);
    }
  }, [transcriptions]);

  return (
    <div className="flex flex-row gap-10">
      <div className="flex flex-row gap-5">
        <Button
          onClick={() => refetchStyles()}
        >
          Refetch Styles
        </Button>
        <SettingsDialog />
      </div>
      <SubtitleTranscriptions />
    </div>
  );
}