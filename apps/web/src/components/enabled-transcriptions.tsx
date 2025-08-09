"use client"

import MultipleSelector from "@/components/multiple-selector"
import TooltipWrapper from "@/components/tooltip-wrapper"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { useDebounce } from "use-debounce"
import { arraysEqual, cn } from "@/lib/utils/utils";
import { useSyncSettings } from "@/lib/hooks/use-sync-settings";
import { settingsQueries } from "@/lib/queries/settings"
import { useSettingsStore } from "@/lib/stores/settings-store";
import { SubtitleTranscription } from "@/types/subtitle"
import { useTranscriptionStore } from "@/lib/stores/transcription-store";
import { subtitleTranscriptions } from "@/lib/constants/subtitle";
import { useEffect, useState, useRef } from "react"
import { handleEnabledTranscriptions } from "@/app/settings/player/actions"

export default function EnabledTranscriptions({
  className = ""
}: {
  className?: string
}) {
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
  }, [debouncedTranscriptions, mutate, playerSettings.enabledTranscriptions]);

  return (
    <TooltipWrapper
      trigger={
        <div className={cn(
          "w-full flex-1",
        )}>
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
            className={cn(
              "w-full",
              className
            )}
          />
        </div>
      }
    >
      Choose which scripts (like Romaji, Hiragana, etc.) are shown as subtitles
    </TooltipWrapper>
  )
}