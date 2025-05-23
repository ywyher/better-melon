'use client'

import SubtitleTranscriptions from "@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSubtitleStyles } from "@/lib/hooks/use-subtitle-styles";
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useEffect } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function Playground() {
  const activeTranscriptions = usePlayerStore((state) => state.activeTranscriptions);
  const setActiveSubtitleFile = usePlayerStore((state) => state.setActiveSubtitleFile);
  const setActiveTranscriptions = usePlayerStore((state) => state.setActiveTranscriptions);
  const setEnglishSubtitleUrl = usePlayerStore((state) => state.setEnglishSubtitleUrl);
  
  // Start the timer when component mounts
  useEffect(() => {
    // Set the initial data in the player store
    setEnglishSubtitleUrl("https://s.megastatics.com/subtitle/92580649ff01096b4a0de6428f58bedb/eng-0.vtt");
    setActiveTranscriptions(['japanese']);
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
  
  const { transcriptions } = useSubtitleTranscriptions()
  const { styles } = useSubtitleStyles();

  useEffect(() => {
    console.log(styles);
  }, [styles]);

  return (
    <div className="relative w-screen h-screen">
      <SubtitleTranscriptions
        styles={styles}        
        transcriptions={transcriptions}
        cuePauseDuration={0}
        definitionTrigger="click"
        syncPlayerSettings="never"
      />
      {/* <ScrollArea className="overflow-y-scroll max-h-[90vh] border-2 rounded-md p-2">
        <SyntaxHighlighter language="json" style={oneDark} customStyle={{ background: 'transparent' }}>
          {JSON.stringify(styles, null, 2)}
        </SyntaxHighlighter>
      </ScrollArea> */}
    </div>
  );
}