"use client"
import { handleEnabledTranscriptions } from "@/app/settings/player/actions"
import MultipleSelector from "@/components/multiple-selector"
import { showSyncSettingsToast } from "@/components/sync-settings-toast"
import TooltipWrapper from "@/components/tooltip-wrapper"
import { subtitleTranscriptions } from "@/lib/constants/subtitle";
import { GeneralSettings, PlayerSettings } from "@/lib/db/schema"
import { settingsQueries } from "@/lib/queries/settings"
import { usePlayerStore } from "@/lib/stores/player-store"
import { SubtitleTranscription } from "@/types/subtitle"
import { useQueryClient } from "@tanstack/react-query"
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
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (playerSettings) {
      setActiveTranscriptions(playerSettings.enabledTranscriptions);
      setSelectedTranscriptions(playerSettings.enabledTranscriptions);
    }
  }, [playerSettings, setActiveTranscriptions]);

  const queryClient = useQueryClient()

  // Effect to handle the debounced changes
  // Use a ref to track the initial render
  const isInitialRender = useRef(true);

  useEffect(() => {
    // Skip the initial render completely
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    
    // Skip if the values are the same (prevents infinite loop)
    if (JSON.stringify(debouncedTranscriptions) === JSON.stringify(activeTranscriptions)) return;
    
    // Skip if both arrays are empty
    if (debouncedTranscriptions.length === 0 && activeTranscriptions.length === 0) return;
    
    const updateTranscriptions = async () => {
      let syncStrategy = syncPlayerSettings;
      
      if (syncStrategy === 'ask') {
        const { strategy, error } = await showSyncSettingsToast();
        if (error) {
          toast.error(error);
          setSelectedTranscriptions(activeTranscriptions);
          return;
        }
        if (!strategy) {
          setSelectedTranscriptions(activeTranscriptions);
          return;
        }
        syncStrategy = strategy;
      }

      if (syncStrategy === 'always' || syncStrategy === 'ask') {
        try {
          setIsLoading(true);
          const { error, message } = await handleEnabledTranscriptions({
            transcriptions: debouncedTranscriptions,
          });
          
          if (error) {
            toast.error(error);
            setSelectedTranscriptions(activeTranscriptions);
            return;
          }
          
          toast.success(message);
          setActiveTranscriptions(debouncedTranscriptions);
          queryClient.invalidateQueries({ queryKey: settingsQueries.general._def });
        } finally {
          setIsLoading(false);
        }
      } else {
        // If no sync needed, just update local state
        setActiveTranscriptions(debouncedTranscriptions);
      }
    };

    updateTranscriptions();
  }, [debouncedTranscriptions, activeTranscriptions, syncPlayerSettings, queryClient, setActiveTranscriptions]);

  return (
    <TooltipWrapper tooltip="Choose which scripts (like Romaji, Hiragana, etc.) are shown as subtitles">
      <div className="w-full flex-1">
        <MultipleSelector
          placeholder="Select transcription to display"
          disabled={isLoading}
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