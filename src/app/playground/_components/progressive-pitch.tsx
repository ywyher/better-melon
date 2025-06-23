'use client'

import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { useEffect } from "react";
import { useProgressivePitchAccent } from "@/lib/hooks/use-progressive-pitch-accent";
import { Loader2 } from "lucide-react";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import SubtitleFileSelector from "@/app/watch/[id]/[ep]/_components/subtitle-file-selector";

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

  const { transcriptions, isLoading: isTranscriptionsLoading } = useSubtitleTranscriptions()
  const {
    pitchLookup,
    isLoading
  } = useProgressivePitchAccent(transcriptions?.find(t => t.transcription == 'japanese')?.cues, '9253') 

  useEffect(() => {
    console.log(`pitchLookup`, pitchLookup)
  }, [pitchLookup])

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