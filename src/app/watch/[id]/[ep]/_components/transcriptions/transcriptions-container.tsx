'use client'

import SubtitleTranscriptions from "@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions";
import { TranscriptionQuery, TranscriptionStyles } from "@/app/watch/[id]/[ep]/types";
import { GeneralSettings, PlayerSettings } from "@/lib/db/schema";

type SubtitleTranscriptionsContainerProps = {
  transcriptions: TranscriptionQuery[],
  styles: TranscriptionStyles;
  syncPlayerSettings: GeneralSettings['syncPlayerSettings']
  pauseOnCue: PlayerSettings['pauseOnCue']
}

export default function SubtitleTranscriptionsContainer({
  transcriptions,
  styles,
  syncPlayerSettings,
  pauseOnCue
}: SubtitleTranscriptionsContainerProps) {
  return (
    <SubtitleTranscriptions 
      transcriptions={transcriptions}
      styles={styles}
      syncPlayerSettings={syncPlayerSettings}
      pauseOnCue={pauseOnCue}
    />
  )
}