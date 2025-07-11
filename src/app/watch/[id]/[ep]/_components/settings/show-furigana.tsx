"use client"

import ToggleButton from "@/components/toggle-button";
import { useEffect, useState } from "react";
import { GeneralSettings, PlayerSettings, SubtitleSettings } from "@/lib/db/schema";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { showSyncSettingsToast } from "@/components/sync-settings-toast";
import { settingsQueries } from "@/lib/queries/settings";
import { SyncStrategy } from "@/types";
import { useWatchDataStore } from "@/lib/stores/watch-store";
import { handleSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/actions";

export default function ShowFurigana({ subtitleSettings, syncPlayerSettings }: { subtitleSettings: SubtitleSettings, syncPlayerSettings: GeneralSettings['syncPlayerSettings'] }) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    
    const showFurigana = useWatchDataStore((state) => state.settings.subtitleSettings.showFurigana)
    const settings = useWatchDataStore((state) => state.settings)
    const setSettings = useWatchDataStore((state) => state.setSettings)

    useEffect(() => {
        if (subtitleSettings) {
          setSettings({
            ...settings,
            subtitleSettings: subtitleSettings
          });
        }
    }, [subtitleSettings]);

    const queryClient = useQueryClient()
    
    const handleChange = async (value: boolean) => {
      console.log(`value`, value)
      setSettings({
        ...settings,
        subtitleSettings: {
          ...subtitleSettings,
          showFurigana: value
        }
      });
      
      let resolvedSyncStrategy = syncPlayerSettings as SyncStrategy;
        
      if (resolvedSyncStrategy === 'ask') {
        console.log('ask')
        const { strategy, error } = await showSyncSettingsToast();
        
        if (error) {
          toast.error(error);
          setSettings({
            ...settings,
            subtitleSettings
          });
          return;
        }
        
        if (!strategy) return;
        
        resolvedSyncStrategy = strategy;
      }
      
      if (resolvedSyncStrategy === 'always' || resolvedSyncStrategy === 'once') {
        console.log('ask')
        try {
          setIsLoading(true);
          const { error, message } = await handleSubtitleSettings({ 'showFurigana': value });
          
          if (error) {
            toast.error(error);
            setSettings({
              ...settings,
              subtitleSettings
            });
            return;
          }
          
          toast.success(message);
          queryClient.invalidateQueries({ queryKey: settingsQueries.player._def })          
          queryClient.invalidateQueries({ queryKey: settingsQueries.forEpisode._def });
        } finally {
          setIsLoading(false);
        }
      }
    };

    return (
        <div className="flex flex-row gap-2">
            <ToggleButton
              name="showFurigana"
              checked={showFurigana}
              onClick={() => handleChange(!showFurigana)}
              className="w-fit"
              disabled={isLoading}
            />
        </div>
    );
}