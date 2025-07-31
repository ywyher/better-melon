"use client"

import { handleEnabledTranscriptions } from "@/app/settings/player/actions"
import MultipleSelector from "@/components/multiple-selector"
import TooltipWrapper from "@/components/tooltip-wrapper"
import { subtitleTranscriptions } from "@/lib/constants/subtitle";
import { GeneralSettings, PlayerSettings } from "@/lib/db/schema"
import { settingsQueries } from "@/lib/queries/settings"
import { useSubtitleStore } from "@/lib/stores/subtitle-store"
import { SubtitleTranscription } from "@/types/subtitle"
import { useMutation } from "@tanstack/react-query"
import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import { useDebounce } from "use-debounce"
import { arraysEqual } from "@/lib/utils/utils";
import { useSyncSettings } from "@/lib/hooks/use-sync-settings";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useTranscriptionStore } from "@/lib/stores/transcription-store";

export default function EnabledTranscriptions() {
  const activeTranscriptions = useTranscriptionStore((state) => state.activeTranscriptions)
  const setActiveTranscriptions = useTranscriptionStore((state) => state.setActiveTranscriptions)
  const [selectedTranscriptions, setSelectedTranscriptions] = useState<SubtitleTranscription[]>([])
  const [debouncedTranscriptions] = useDebounce(selectedTranscriptions, 1000)
  const syncSettings = useSettingsStore((settings) => settings.general.syncSettings)
  const playerSettings = useSettingsStore((settings) => settings.player)

  const hasInitializedRef = useRef(false)
  const hasUserChangedRef = useRef(false)

  const { handleSync } = useSyncSettings({
    syncSettings,
    onSuccess: (message) => toast.success(message || "Transcriptions updated successfully"),
    onError: (error) => {
      toast.error(error);
      setSelectedTranscriptions(activeTranscriptions);
    },
    invalidateQueries: [settingsQueries.general._def]
  });

  useEffect(() => {
    if (playerSettings && !hasInitializedRef.current) {
      setActiveTranscriptions(playerSettings.enabledTranscriptions);
      setSelectedTranscriptions(playerSettings.enabledTranscriptions);
      hasInitializedRef.current = true;
    }
  }, [playerSettings, setActiveTranscriptions]);

  const { mutate, isPending } = useMutation({
    mutationKey: ['enabled-transcriptions'],
    mutationFn: async (newTranscriptions: SubtitleTranscription[]) => {
      await handleSync({
        localOperation: () => setActiveTranscriptions(newTranscriptions),
        serverOperation: () => handleEnabledTranscriptions({
          transcriptions: newTranscriptions,
        }),
        successMessage: "Transcriptions updated successfully"
      });
    }
  });

  useEffect(() => {
    if (!hasInitializedRef.current || !hasUserChangedRef.current) return;
    
    if (arraysEqual(debouncedTranscriptions, playerSettings.enabledTranscriptions)) return;
    
    mutate(debouncedTranscriptions);
  }, [debouncedTranscriptions, mutate]);

  return (
    <TooltipWrapper
      trigger={
        <div className="w-full flex-1">
          <MultipleSelector
            placeholder="Select transcription to display"
            disabled={isPending}
            options={subtitleTranscriptions.map((transcription) => ({
              value: transcription,
              label: transcription,
            }))}
            value={selectedTranscriptions.map((transcription) => ({
              value: transcription,
              label: transcription,
            }))}
            onChange={(transcriptions) => {
              hasUserChangedRef.current = true;
              setSelectedTranscriptions(transcriptions.map((transcription) => transcription.value) as SubtitleTranscription[]);
            }}
            className="w-full"
          />
        </div>
      }
    >
      Choose which scripts (like Romaji, Hiragana, etc.) are shown as subtitles
    </TooltipWrapper>
  )
}