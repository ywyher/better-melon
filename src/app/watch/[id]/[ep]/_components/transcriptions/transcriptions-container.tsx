'use client'

import SubtitleTranscriptions from "@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions";
import { TranscriptionQuery, TranscriptionStyles } from "@/app/watch/[id]/[ep]/types";
import { useEffect } from "react";

type SubtitleTranscriptionsContainerProps = {
  transcriptions: TranscriptionQuery[],
  styles: TranscriptionStyles
}

export default function SubtitleTranscriptionsContainer({
  transcriptions,
  styles
}: SubtitleTranscriptionsContainerProps) {
  return (
    <SubtitleTranscriptions 
      transcriptions={transcriptions}
      styles={styles}
    />
  )
}