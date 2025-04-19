"use client"

import { handlePlaybackSetting } from "@/app/settings/player/actions";
import { Switch } from "@/components/ui/switch";
import { PlayerSettings as TPlayerSettings } from "@/lib/db/schema";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Define setting types for the component
type SettingType = 'autoPlay' | 'autoNext' | 'autoSkip';

export default function AutoPlaybackSettings({ playerSettings }: { playerSettings: TPlayerSettings }) {
    const queryClient = useQueryClient();

    // Generic handler for all setting changes
    const handleSettingChange = async (
        settingType: SettingType, 
        checked: boolean, 
    ) => {
        const { error, message } = await handlePlaybackSetting(settingType, checked);

        if (error) {
            toast.error(error);
            return;
        }
        
        queryClient.invalidateQueries({ queryKey: ['settings', 'player-settings'], exact: true });
        toast.success(message || `${settingType} setting updated`);
    };

    // Setting configurations
    const settings = [
        {
            name: 'Auto Play',
            description: 'Automatically play videos when loaded',
            type: 'autoPlay' as SettingType,
            checked: playerSettings.autoPlay,
            handler: (checked: boolean) => handleSettingChange('autoPlay', checked)
        },
        {
            name: 'Auto Next',
            description: 'Automatically play the next video in the playlist',
            type: 'autoNext' as SettingType,
            checked: playerSettings.autoNext,
            handler: (checked: boolean) => handleSettingChange('autoNext', checked)
        },
        {
            name: 'Auto Skip',
            description: 'Automatically skip intro/outro segments',
            type: 'autoSkip' as SettingType,
            checked: playerSettings.autoSkip,
            handler: (checked: boolean) => handleSettingChange('autoSkip', checked)
        }
    ];

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Automatic Playback</h2>
            <p className="text-muted-foreground mb-6 text-sm">
                Configure how videos automatically play and progress
            </p>
            
            <div className="flex flex-col gap-5">
                {settings.map(setting => (
                    <div key={setting.type} className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-border last:border-0 last:pb-0">
                        <div className="space-y-1">
                            <h3 className="font-medium">{setting.name}</h3>
                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </div>
                        <div>
                            <Switch
                                checked={setting.checked}
                                onCheckedChange={setting.handler}
                                className="mt-2 md:mt-0"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}