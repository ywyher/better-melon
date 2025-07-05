'use client'

import { useEffect } from "react";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { getCache } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";

export default function TranscriptionsPlayground() {
  const setActiveSubtitleFile = useSubtitleStore((state) => state.setActiveSubtitleFile);
  const setActiveTranscriptions = useSubtitleStore((state) => state.setActiveTranscriptions);
  const setEnglishSubtitleUrl = useSubtitleStore((state) => state.setEnglishSubtitleUrl);

  useEffect(() => {
    // setActiveTranscriptions(['japanese']);
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

  useSubtitleTranscriptions()

  const cache = async () => {
    const raw = await getCache('subtitle:https://jimaku.cc/entry/1323/download/%5BMoozzi2%5D%20Made%20in%20Abyss%20-%2009%20(BD%201920x1080%20x.264%20Flac).ass')

    const cache = JSON.parse(raw || "")
    console.log(cache)
  }
  
  return (
    <div className="flex flex-row gap-10">
      <Button
        onClick={async () => await cache()} 
      >
        get cache
      </Button>
    </div>
  );
}