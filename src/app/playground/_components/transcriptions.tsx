'use client'

import SubtitleTranscriptions from "@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions";
import DefinitionCard from "@/components/definition-card/definition-card";
import { useSubtitleStyles } from "@/lib/hooks/use-subtitle-styles";
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useEffect } from "react";

export default function TranscriptionsPlayground() {
  const setActiveSubtitleFile = usePlayerStore((state) => state.setActiveSubtitleFile);
  const setActiveTranscriptions = usePlayerStore((state) => state.setActiveTranscriptions);
  
  useEffect(() => {
    setActiveTranscriptions(['japanese', 'furigana']);
    setActiveSubtitleFile({
      file: {
        last_modified: "2024-04-28T16:23:56.084911647Z",
        name: "[Judas] Steins;Gate - S01E02.srt",
        size: 36924,
        url: "https://jimaku.cc/entry/1323/download/%5BMoozzi2%5D%20Made%20in%20Abyss%20-%2009%20(BD%201920x1080%20x.264%20Flac).ass"
      },
      source: 'remote'
    });
  }, [setActiveTranscriptions, setActiveSubtitleFile]);
  
  const { transcriptions, transcriptionsLookup } = useSubtitleTranscriptions()
  const { styles } = useSubtitleStyles();

  return (
    <>
      <DefinitionCard />
      <SubtitleTranscriptions
        transcriptions={transcriptions}
        styles={styles}
        syncPlayerSettings={'always'}
        cuePauseDuration={0}
        definitionTrigger={'click'}
        transcriptionsLookup={transcriptionsLookup}
      />
    </>
  );
}