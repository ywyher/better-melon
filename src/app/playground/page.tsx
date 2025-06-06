'use client'

import SubtitleTranscriptions from "@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions";
import DefinitionCard from "@/components/definition-card/definition-card";
import { useSubtitleStyles } from "@/lib/hooks/use-subtitle-styles";
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useEffect } from "react";

export default function Playground() {
  const activeTranscriptions = usePlayerStore((state) => state.activeTranscriptions);
  const setActiveSubtitleFile = usePlayerStore((state) => state.setActiveSubtitleFile);
  const setActiveTranscriptions = usePlayerStore((state) => state.setActiveTranscriptions);
  const setEnglishSubtitleUrl = usePlayerStore((state) => state.setEnglishSubtitleUrl);
  
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

  return (
    <div className="relative h-screen">
      <DefinitionCard />
      {/* <SubtitleTranscriptions
        styles={styles}
        transcriptions={transcriptions}
        cuePauseDuration={0}
        definitionTrigger="click"
        syncPlayerSettings="never"
        transcriptionsLookup={transcriptionsLookup}
      /> */}
    </div>
  );
}