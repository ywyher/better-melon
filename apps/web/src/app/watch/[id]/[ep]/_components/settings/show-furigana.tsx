"use client"

import ToggleButton from "@/components/toggle-button";
import { toast } from "sonner";
import { settingsQueries } from "@/lib/queries/settings";
import { useWatchDataStore } from "@/lib/stores/watch-store";
import { handleSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/actions";
import { defaultSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/constants";
import { useSyncSettings } from "@/lib/hooks/use-sync-settings";
import { useEffect, useState } from "react";
import { GeneralSettings, SubtitleSettings } from "@/lib/db/schema";

export default function ShowFurigana({ subtitleSettings, syncSettings }: { subtitleSettings: SubtitleSettings, syncSettings: GeneralSettings['syncSettings'] }) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    
    const showFurigana = useWatchDataStore((state) => state.settings.subtitleSettings.showFurigana)
    const settings = useWatchDataStore((state) => state.settings)
    const setSettings = useWatchDataStore((state) => state.setSettings)

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
        if (subtitleSettings) {
          setSettings({
            ...settings,
            subtitleSettings: subtitleSettings
          });
        }
    }, [subtitleSettings]);

    const handleChange = async (value: boolean) => {
      setSettings({
        ...settings,
        subtitleSettings: {
          ...(subtitleSettings || defaultSubtitleSettings),
          showFurigana: value
        }
      });

      const { success } = await handleSync({
        localOperation: () => {
          setSettings({
            ...settings,
            subtitleSettings: {
              ...(subtitleSettings || defaultSubtitleSettings),
              showFurigana: value
            }
          })
        },
        serverOperation: () => handleSubtitleSettings({ 'showFurigana': value }),
      })

      if(!success) {
        setSettings({
          ...settings,
          subtitleSettings
        });
      }

      setIsLoading(false)
    };

    return (
        <div className="flex flex-row gap-2">
            <ToggleButton
              name="Show Furigana"
              checked={showFurigana}
              onClick={() => handleChange(!showFurigana)}
              className="w-fit"
              disabled={isLoading}
            />
        </div>
    );
}