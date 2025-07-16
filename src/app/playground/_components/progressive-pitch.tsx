'use client'

import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { useEffect } from "react";
import { usePitchAccentChunks } from "@/lib/hooks/use-pitch-accent-chunks";
import { Loader2 } from "lucide-react";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import SubtitleFileSelector from "@/app/watch/[id]/[ep]/_components/subtitle-file-selector";
import { useSettingsForEpisode } from "@/lib/hooks/use-settings-for-episode";
import { useInitializeTokenizer } from "@/lib/hooks/use-initialize-tokenizer";

export default function ProgressivePitchPlayground() {
  const setActiveSubtitleFile = useSubtitleStore((state) => state.setActiveSubtitleFile);
  const setActiveTranscriptions = useSubtitleStore((state) => state.setActiveTranscriptions);

  useEffect(() => {
    setActiveTranscriptions(['japanese']);
    setActiveSubtitleFile({
      source: "remote",
      file: {
        name: "[KissSub][Steins;Gate][02][GB_BIG5_JP][BDrip][1080P][HEVC].ass",
        url: "https://jimaku.cc/entry/1310/download/%5BKissSub%5D%5BSteins%3BGate%5D%5B02%5D%5BGB_BIG5_JP%5D%5BBDrip%5D%5B1080P%5D%5BHEVC%5D.ass",
        last_modified: "2024-04-28T16:23:14.21334011Z",
        size: 65574
      }
    });
  }, [setActiveTranscriptions, setActiveSubtitleFile]);

  const { isInitialized } = useInitializeTokenizer()
  const { transcriptions, isLoading: isTranscriptionsLoading } = useSubtitleTranscriptions({
    isTokenizerInitialized: isInitialized,
    animeId: '9253',
    episodeNumber: 2
  })
  const { settings } = useSettingsForEpisode()
  const { pitchLookup } = usePitchAccentChunks({
    animeId: '9253',
    japaneseCues: transcriptions?.find(t => t.transcription == 'japanese')?.cues || [],
    shouldFetch: settings?.wordSettings.pitchColoring || false
  })

  return (
    <div className="flex flex-col justify-between gap-10">
      <SubtitleFileSelector />
      {isTranscriptionsLoading && (
        <div className="flex flex-row gap-2">
          <Loader2 className="animate-spin" />
          <p>Transcriptions Loading</p>
        </div>
      )}
    </div>
  );
}