import SubtitleTranscriptions from "@/app/watch/[id]/[ep]/components/transcriptions/transcriptions";
import transcriptions from './transcriptions.json'
import DefinitionCard from "@/components/definition-card/definition-card";
import { useTranscriptionStore } from "@/lib/stores/transcription-store";
import { hasChanged } from "@/lib/utils/utils";
import { useEffect } from "react";
import { TranscriptionQuery } from "@/app/watch/[id]/[ep]/types";
import { useSubtitleStyles } from "@/lib/hooks/use-subtitle-styles";

export default function TranscriptionsStaticPlayground() {
  const setActiveTranscriptions = useTranscriptionStore((state) => state.setActiveTranscriptions);

  useEffect(() => {
    setActiveTranscriptions(['japanese', 'hiragana', 'english']);
  }, [setActiveTranscriptions]);

  const setTranscriptions = useTranscriptionStore((state) => state.setTranscriptions)
  const store = useTranscriptionStore.getState();
  useSubtitleStyles()

  useEffect(() => {
    if (transcriptions && hasChanged(transcriptions, store.transcriptions)) {
      setTranscriptions(transcriptions as TranscriptionQuery[]);
    }
  }, [transcriptions, setTranscriptions, store.transcriptions]);

  return (
    <>
      <SubtitleTranscriptions />
      <DefinitionCard />
    </>
  )
}