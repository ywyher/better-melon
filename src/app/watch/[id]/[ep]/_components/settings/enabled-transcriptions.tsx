"use client"
import { handleEnabledTranscriptions } from "@/app/settings/player/actions"
import MultipleSelector from "@/components/multiple-selector"
import { showSyncSettingsToast } from "@/components/sync-settings-toast"
import TooltipWrapper from "@/components/tooltip-wrapper"
import { subtitleTranscriptions } from "@/lib/constants/subtitle";
import { GeneralSettings, PlayerSettings } from "@/lib/db/schema"
import { settingsQueries } from "@/lib/queries/settings"
import { usePlayerStore } from "@/lib/stores/player-store"
import { SyncStrategy } from "@/types"
import { SubtitleTranscription } from "@/types/subtitle"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import { useDebounce } from "use-debounce"

type EnabledTranscriptionsSettingProps = {
  playerSettings: PlayerSettings
  syncPlayerSettings: GeneralSettings['syncPlayerSettings']
}

export default function EnabledTranscriptions({ playerSettings, syncPlayerSettings }: EnabledTranscriptionsSettingProps) {
  const activeTranscriptions = usePlayerStore((state) => state.activeTranscriptions)
  const setActiveTranscriptions = usePlayerStore((state) => state.setActiveTranscriptions)
  const [selectedTranscriptions, setSelectedTranscriptions] = useState<SubtitleTranscription[]>([])
  const [debouncedTranscriptions] = useDebounce(selectedTranscriptions, 1000) // 1000ms debounce

  const hasInitializedRef = useRef(false)

  useEffect(() => {
    // Only set initial values from playerSettings if we haven't done so already
    if (playerSettings && !hasInitializedRef.current) {
      setActiveTranscriptions(playerSettings.enabledTranscriptions);
      setSelectedTranscriptions(playerSettings.enabledTranscriptions);
      hasInitializedRef.current = true;
    }
  }, [playerSettings, setActiveTranscriptions]);

  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationKey: ['enabled-transcriptions'],
    mutationFn: async (newTranscriptions: SubtitleTranscription[]) => {
      let resolvedSyncStrategy = syncPlayerSettings as SyncStrategy;
      
      if (resolvedSyncStrategy === 'ask') {
        const { strategy, error } = await showSyncSettingsToast();
        if (error) {
          toast.error(error);
          setSelectedTranscriptions(activeTranscriptions);
          return;
        }
        if(!strategy) {
          setActiveTranscriptions(newTranscriptions);
          return;
        }
        resolvedSyncStrategy = strategy;
      }

      if (resolvedSyncStrategy === 'always' || resolvedSyncStrategy === 'once') {
        try {
          const { error, message } = await handleEnabledTranscriptions({
            transcriptions: newTranscriptions,
          });
          
          if (error) {
            toast.error(error);
            setSelectedTranscriptions(activeTranscriptions);
            return;
          }
          
          toast.success(message);
          setActiveTranscriptions(newTranscriptions);
          queryClient.invalidateQueries({ queryKey: settingsQueries.general._def });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Failed to update transcriptions");
          setSelectedTranscriptions(activeTranscriptions);
        }
      } else {
        setActiveTranscriptions(newTranscriptions);
      }
    }
  });

  useEffect(() => {
    if((!debouncedTranscriptions.length && hasInitializedRef) 
      || !playerSettings.enabledTranscriptions.length) return;
    if(debouncedTranscriptions == playerSettings.enabledTranscriptions) return;
    mutate(debouncedTranscriptions);
  }, [debouncedTranscriptions, playerSettings, mutate]);

  return (
    <TooltipWrapper tooltip="Choose which scripts (like Romaji, Hiragana, etc.) are shown as subtitles">
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
            setSelectedTranscriptions(transcriptions.map((transcription) => transcription.value) as SubtitleTranscription[]);
          }}
          className="w-full"
        />
      </div>
    </TooltipWrapper>
  )
}