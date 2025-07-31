import { Button } from "@/components/ui/button";
import { useSubtitleStyles } from "@/lib/hooks/use-subtitle-styles";
import { useTranscriptionStore } from "@/lib/stores/transcription-store";
import { hasChanged } from "@/lib/utils/utils";
import { useEffect } from "react";

export default function StylesPlayground() {
  const store = useTranscriptionStore.getState();
  const activeTranscriptions = useTranscriptionStore((state) => state.activeTranscriptions);
  const setActiveTranscriptions = useTranscriptionStore((state) => state.setActiveTranscriptions);

  useEffect(() => {
    if(hasChanged(activeTranscriptions, store.activeTranscriptions)) {
      setActiveTranscriptions(['japanese', 'hiragana']);
    }
  }, [activeTranscriptions]);

  const { styles, isLoading, refetch } = useSubtitleStyles()

  return (
    <div className="bg-white">
      <Button
        onClick={() => refetch()}
      >
        Refetch
      </Button>
    </div>
  )
}