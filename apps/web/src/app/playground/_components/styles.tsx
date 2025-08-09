import SettingsDialog from "@/app/watch/[id]/[ep]/components/settings/settings-dialog";
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
  }, [activeTranscriptions, setActiveTranscriptions, store]);

  const { rawStyles, computedStyles, refetch } = useSubtitleStyles()

  useEffect(() => {
    console.log(`styles`, {
      rawStyles,
      computedStyles,
    })
  }, [computedStyles, rawStyles])

  return (
    <div className="flex flex-row gap-5">
      <Button
        onClick={() => refetch()}
      >
        Refetch
      </Button>
      <SettingsDialog />
    </div>
  )
}