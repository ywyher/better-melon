'use client'

import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { useEffect } from "react";
import { usePitchAccentChunks } from "@/lib/hooks/use-pitch-accent-chunks";
import { Loader2 } from "lucide-react";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import SubtitleFileSelector from "@/app/watch/[id]/[ep]/_components/subtitle-file-selector";
import { useSettingsForEpisode } from "@/lib/hooks/use-settings-for-episode";
import { useInitializeTokenizer } from "@/lib/hooks/use-initialize-tokenizer";

export default function ProgressivePitch() {
  const setActiveSubtitleFile = useSubtitleStore((state) => state.setActiveSubtitleFile);
  const setActiveTranscriptions = useSubtitleStore((state) => state.setActiveTranscriptions);

  useEffect(() => {
    setActiveTranscriptions(['japanese']);
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

  const { isInitialized } = useInitializeTokenizer()
  const { transcriptions, isLoading: isTranscriptionsLoading } = useSubtitleTranscriptions(isInitialized)
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