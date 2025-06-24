import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions"
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { useEffect } from "react";

export default function TransHook() {
  const setActiveSubtitleFile = useSubtitleStore((state) => state.setActiveSubtitleFile);
  const setActiveTranscriptions = useSubtitleStore((state) => state.setActiveTranscriptions);
  const setEnglishSubtitleUrl = useSubtitleStore((state) => state.setEnglishSubtitleUrl);

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
  }, [setEnglishSubtitleUrl, setActiveTranscriptions, setActiveSubtitleFile]);
  
  useSubtitleTranscriptions()

  return (
    <>
      hey
    </>
  )
}