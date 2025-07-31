"use client"

import ToggleButton from "@/components/toggle-button";
import { useEffect, useState } from "react";
import { GeneralSettings, PlayerSettings } from "@/lib/db/schema";
import { toast } from "sonner";
import { settingsQueries } from "@/lib/queries/settings";
import { handlePlayerSettings } from "@/app/settings/player/actions";
import { usePlaybackSettingsStore } from "@/lib/stores/playback-settings-store";
import { useSyncSettings } from "@/lib/hooks/use-sync-settings";

type TogglesProps = { 
    playerSettings: PlayerSettings
    syncSettings: GeneralSettings['syncSettings']
}

type PlaybackSetting = 'autoPlay' | 'autoNext' | 'autoSkip' | 'pauseOnCue';

export default function PlaybackToggles({ playerSettings, syncSettings }: TogglesProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    
    const { autoPlay, autoNext, autoSkip, pauseOnCue, setAutoPlay, setAutoNext, setAutoSkip, setPauseOnCue, updateAll } = usePlaybackSettingsStore();

    const { handleSync } = useSyncSettings({
        syncSettings,
        onSuccess: (message) => toast.success(message || "Settings updated successfully"),
        onError: (error) => {
            toast.error(error);
        },
        invalidateQueries: [
            settingsQueries.player._def,
            settingsQueries.forEpisode._def
        ]
    });

    useEffect(() => {
        if (playerSettings) {
            updateAll(playerSettings);
        }
    }, [playerSettings]);
    
    const setters = {
        autoNext: setAutoNext,
        autoPlay: setAutoPlay,
        autoSkip: setAutoSkip,
        pauseOnCue: setPauseOnCue,
    };

    const updateSettingState = (setting: PlaybackSetting, value: boolean) => {
        setters[setting](value);
    };

    const handleValueChange = async (setting: PlaybackSetting, value: boolean) => {
        setIsLoading(true);
        
        const result = await handleSync({
            localOperation: () => updateSettingState(setting, value),
            serverOperation: () => handlePlayerSettings({ [setting]: value }),
            successMessage: "Settings updated successfully"
        });

        if (!result.success) {
            updateSettingState(setting, !value);
        }
        
        setIsLoading(false);
    };

    return (
        <div className="flex flex-row gap-2">
            <ToggleButton
                name="Auto Play"
                checked={autoPlay}
                onClick={() => handleValueChange('autoPlay', !autoPlay)}
                className="w-fit"
                disabled={isLoading}
                tooltip={
                    <div className="text-center">
                        Auto play episode <br />
                        <span className="font-bold text-red-500">Note: player will be muted by default</span>
                    </div>
                }
            />
            <ToggleButton
                name="Auto Next"
                checked={autoNext}
                onClick={() => handleValueChange('autoNext', !autoNext)}
                className="w-fit"
                disabled={isLoading}
                tooltip="Automatically go to the next episode after finishing"
            />
            <ToggleButton
                name="Auto Skip"
                checked={autoSkip}
                onClick={() => handleValueChange('autoSkip', !autoSkip)}
                className="w-fit"
                disabled={isLoading}
                tooltip="Automatically skip intros and outros"
            />
            <ToggleButton
                name="Pause on cue"
                checked={pauseOnCue}
                onClick={() => handleValueChange('pauseOnCue', !pauseOnCue)}
                className="w-fit"
                disabled={isLoading}
                tooltip="Automatically pause after each cue is spoken"
            />
        </div>
    );
}