'use client'

import { useEffect } from "react";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import SubtitleFileSelector from "@/app/watch/[id]/[ep]/components/subtitles/subtitle-file-selector";
import { useWatchDataStore } from "@/lib/stores/watch-store";
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { useInitializeTokenizer } from "@/lib/hooks/use-initialize-tokenizer";

export default function TranscriptionsPlayground() {
  const episodeData = useWatchDataStore((state) => state.episodeData)
  const setEpisodeData = useWatchDataStore((state) => state.setEpisodeData)

  useEffect(() => {
    if(!episodeData) return
    setEpisodeData({
      ...episodeData,
      subtitles: [
        {
          "url": "https://jimaku.cc/entry/1323/download/%5BMoozzi2%5D%20Made%20in%20Abyss%20-%2009%20(BD%201920x1080%20x.264%20Flac).ass",
          "name": "[Moozzi2] Made in Abyss - 09 (BD 1920x1080 x.264 Flac).ass",
          "size": 21020,
          "last_modified": "2024-03-03T14:05:00Z"
        },
        {
          "url": "https://jimaku.cc/entry/1323/download/%E3%83%A1%E3%82%A4%E3%83%89%E3%82%A4%E3%83%B3%E3%82%A2%E3%83%93%E3%82%B9.S01E09.%E5%A4%A7%E6%96%AD%E5%B1%A4.WEBRip.Netflix.ja%5Bcc%5D.srt",
          "name": "メイドインアビス.S01E09.大断層.WEBRip.Netflix.ja[cc].srt",
          "size": 24331,
          "last_modified": "2024-11-25T19:50:45.147895847Z"
        }
      ]
    })
  }, [episodeData])

  const { isInitialized } = useInitializeTokenizer()
  useSubtitleTranscriptions(isInitialized)

  return (
    <div className="flex flex-row gap-10">
      <SubtitleFileSelector />
    </div>
  );
}