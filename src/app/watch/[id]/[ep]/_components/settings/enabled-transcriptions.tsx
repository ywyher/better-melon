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
import { useEffect, useState } from "react"
import { toast } from "sonner"

type EnabledTranscriptionsSettingProps = { 
    playerSettings: PlayerSettings
    syncPlayerSettings: GeneralSettings['syncPlayerSettings']
}

export default function EnabledTranscriptions({ playerSettings, syncPlayerSettings }: EnabledTranscriptionsSettingProps ) {
    const activeTranscriptions = usePlayerStore((state) => state.activeTranscriptions)
    const setActiveTranscriptions = usePlayerStore((state) => state.setActiveTranscriptions)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (playerSettings) {
            setActiveTranscriptions(playerSettings.enabledTranscriptions);
        }
    }, [playerSettings, setActiveTranscriptions]);

    const queryClient = useQueryClient()

    const handleTranscriptionsChange = async (transcriptions: SubtitleTranscription[]) => {
        setActiveTranscriptions(transcriptions)
        let syncStrategy = syncPlayerSettings;
        
        if (syncStrategy === 'ask') {
          const { strategy, error } = await showSyncSettingsToast();
          
          if (error) {
            toast.error(error);
            setActiveTranscriptions(activeTranscriptions)
            return;
          }
          
          if (!strategy) return;

          
          syncStrategy = strategy;
        }

        if (syncStrategy === 'always' || syncStrategy === 'ask') {
            try {
                setIsLoading(true);
                const { error, message } = await handleEnabledTranscriptions({
                    transcriptions,
                });
                
                if (error) {
                    toast.error(error);
                    setActiveTranscriptions(activeTranscriptions)
                    return;
                }
                
                toast.success(message);
                queryClient.invalidateQueries({ queryKey: settingsQueries.general._def })
            } finally {
                setIsLoading(false);
            }
        }

    }

    return (
        <TooltipWrapper tooltip="Choose which scripts (like Romaji, Hiragana, etc.) are shown as subtitles">
            <div className="w-full flex-1">
                <MultipleSelector
                    placeholder="Select transcription to display"
                    disabled={isLoading}
                    options={subtitleTranscriptions.map((transcirption) => ({
                        value: transcirption,
                        label: transcirption,
                    }))}
                    value={activeTranscriptions.map((transcription) => ({
                        value: transcription,
                        label: transcription,
                    }))}
                    onChange={(transcriptions) => {
                        handleTranscriptionsChange(transcriptions.map((transcription) => transcription.value) as SubtitleTranscription[])
                    }}
                    className="w-full"
                />
            </div>
        </TooltipWrapper>
    )
}