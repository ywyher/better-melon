"use client";

import ToggleButton from "@/components/toggle-button";
import { useState } from "react";
import { toast } from "sonner";
import { settingsQueries } from "@/lib/queries/settings";
import { handlePlayerSettings } from "@/app/settings/player/actions";
import { SettingsStore, useSettingsStore } from "@/lib/stores/settings-store";
import { useSyncSettings } from "@/lib/hooks/use-sync-settings";
import { handleSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/actions";
import { handleWordSettings } from "@/app/settings/word/_settings/actions";

interface ToggleConfig {
  key: string;
  name: string;
  tooltip: string | React.ReactNode;
  getValue: (store: SettingsStore) => boolean;
  updateLocal: (store: SettingsStore, value: boolean) => void;
  updateServer: (value: boolean) => Promise<{ message: string | null; error: string | null }>;
}

export default function SettingsToggles() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const store = useSettingsStore();
  const {
    player,
    subtitle,
    general: { syncSettings },
    word,
    updatePlayer,
    updateSubtitle,
    updateWord
   } = store

  const { handleSync } = useSyncSettings({
    syncSettings: syncSettings,
    onSuccess: (message) =>
      toast.success(message || "Settings updated successfully"),
    onError: (error) => {
      toast.error(error);
    },
    invalidateQueries: [
      settingsQueries.player._def,
      settingsQueries.subtitle._def,
      settingsQueries.general._def,
      settingsQueries.forEpisode._def,
    ],
  });

  const TOGGLE_CONFIGS: ToggleConfig[] = [
    {
      key: "autoPlay",
      name: "Auto Play",
      getValue: () => player.autoPlay,
      updateLocal: (_, value) => updatePlayer({ autoPlay: value }),
      updateServer: (value) => handlePlayerSettings({ autoPlay: value }),
      tooltip: (
        <div className="text-center">
          Auto play episode <br />
          <span className="font-bold text-red-500">
            Note: player will be muted by default
          </span>
        </div>
      ),
    },
    {
      key: "autoNext",
      name: "Auto Next",
      getValue: () => player.autoNext,
      updateLocal: (_, value) => updatePlayer({ autoNext: value }),
      updateServer: (value) => handlePlayerSettings({ autoNext: value }),
      tooltip: "Automatically go to the next episode after finishing",
    },
    {
      key: "autoSkip",
      name: "Auto Skip",
      getValue: () => player.autoSkip,
      updateLocal: (_, value) => updatePlayer({ autoSkip: value }),
      updateServer: (value) => handlePlayerSettings({ autoSkip: value }),
      tooltip: "Automatically skip intros and outros",
    },
    {
      key: "pauseOnCue",
      name: "Pause on cue",
      getValue: () => player.pauseOnCue,
      updateLocal: (_, value) => updatePlayer({ pauseOnCue: value }),
      updateServer: (value) => handlePlayerSettings({ pauseOnCue: value }),
      tooltip: "Automatically pause after each cue is spoken",
    },
    {
      key: "showFurigana",
      name: "Show Furigana",
      getValue: () => subtitle.showFurigana,
      updateLocal: (_, value) => updateSubtitle({ showFurigana: value }),
      updateServer: (value) => handleSubtitleSettings({ showFurigana: value }),
      tooltip: "Display furigana (reading aids) above kanji characters",
    },
    {
      key: "pitchColoring",
      name: "Pitch Coloring",
      getValue: () => word.pitchColoring,
      updateLocal: (_, value) => updateWord({ pitchColoring: value }),
      updateServer: (value) => handleWordSettings({ pitchColoring: value }),
      tooltip: "Color words based on its pitch accent",
    },
    {
      key: "learningStatus",
      name: "Learning Status",
      getValue: () => word.learningStatus,
      updateLocal: (_, value) => updateWord({ learningStatus: value }),
      updateServer: (value) => handleWordSettings({ learningStatus: value }),
      tooltip: "Show a special mark under words depending on its learning status",
    },
  ];

  const handleValueChange = async (config: ToggleConfig, newValue: boolean) => {
    setIsLoading(true);

    const result = await handleSync({
      localOperation: () => config.updateLocal(store, newValue),
      serverOperation: () => config.updateServer(newValue),
      successMessage: "Settings updated successfully",
    });

    if (!result.success) {
      config.updateLocal(store, !newValue);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex gap-1 flex-wrap justify-between">
      {TOGGLE_CONFIGS.map((config) => {
        const currentValue = config.getValue(store);
        return (
          <ToggleButton
            key={config.key}
            name={config.name}
            checked={currentValue}
            onClick={() => handleValueChange(config, !currentValue)}
            className="w-fit"
            disabled={isLoading}
            tooltip={config.tooltip}
          />
        );
      })}
    </div>
  );
}