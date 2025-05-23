'use client'

import SubtitleTranscriptions from "@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions";
import { TranscriptionQuery, TranscriptionStyles } from "@/app/watch/[id]/[ep]/types";
import { GeneralSettings, PlayerSettings, SubtitleSettings } from "@/lib/db/schema";

type SubtitleTranscriptionsContainerProps = {
  transcriptions: TranscriptionQuery[],
  styles: TranscriptionStyles;
  syncPlayerSettings: GeneralSettings['syncPlayerSettings'];
  cuePauseDuration: PlayerSettings['cuePauseDuration'];
  definitionTrigger: SubtitleSettings['definitionTrigger']
}

export default function SubtitleTranscriptionsContainer({
  transcriptions,
  styles,
  syncPlayerSettings,
  cuePauseDuration,
  definitionTrigger
}: SubtitleTranscriptionsContainerProps) {
  return (
    <SubtitleTranscriptions 
      transcriptions={transcriptions}
      styles={styles}
      syncPlayerSettings={syncPlayerSettings}
      cuePauseDuration={cuePauseDuration}
      definitionTrigger={definitionTrigger}
    />
  )
}