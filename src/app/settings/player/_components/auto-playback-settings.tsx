"use client"
import { handlePlaybackSetting } from "@/app/settings/player/actions";
import { Switch } from "@/components/ui/switch";
import { PlayerSettings as TPlayerSettings } from "@/lib/db/schema";
import { settingsQueries } from "@/lib/queries/settings";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type SettingType = 'autoPlay' | 'autoNext' | 'autoSkip';

export default function AutoPlaybackSettings({ playerSettings }: { playerSettings: TPlayerSettings }) {
  const queryClient = useQueryClient();
  
  const [localSettings, setLocalSettings] = useState({
    autoPlay: playerSettings.autoPlay,
    autoNext: playerSettings.autoNext,
    autoSkip: playerSettings.autoSkip
  });

  const handleSettingChange = async (
    settingType: SettingType,
    checked: boolean,
  ) => {
    setLocalSettings(prev => ({
      ...prev,
      [settingType]: checked
    }));
    
    try {
        const { error, message } = await handlePlaybackSetting({
            settingName: settingType,
            checked
        });
      
      if (error) {
        setLocalSettings(prev => ({
          ...prev,
          [settingType]: !checked
        }));
        toast.error(error);
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: settingsQueries.player._def });
      toast.success(message || `${settingType} setting updated`);
    } catch (error) {
      setLocalSettings(prev => ({
        ...prev,
        [settingType]: !checked
      }));
      toast.error("Failed to update setting. Please try again.");
    }
  };

  const settings = [
    {
      name: 'Auto Play',
      description: 'Automatically play videos when loaded',
      type: 'autoPlay' as SettingType,
      checked: localSettings.autoPlay,
      handler: (checked: boolean) => handleSettingChange('autoPlay', checked)
    },
    {
      name: 'Auto Next',
      description: 'Automatically play the next video in the playlist',
      type: 'autoNext' as SettingType,
      checked: localSettings.autoNext,
      handler: (checked: boolean) => handleSettingChange('autoNext', checked)
    },
    {
      name: 'Auto Skip',
      description: 'Automatically skip intro/outro segments',
      type: 'autoSkip' as SettingType,
      checked: localSettings.autoSkip,
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