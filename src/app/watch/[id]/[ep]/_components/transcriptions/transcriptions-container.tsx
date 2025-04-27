'use client'

import SubtitleTranscriptions from "@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions";
import { useSubtitleTranscriptions } from "@/lib/queries/subtitle";

export default function SubtitleTranscriptionsContainer() {
  // having this inside of SubtitleTranscriptions cause it to re-render for no reason
  const subtitleQueries = useSubtitleTranscriptions()

  return (
    <SubtitleTranscriptions 
      subtitleQueries={subtitleQueries}
    />
  )
}