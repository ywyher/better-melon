import { defaultPlayerSettings } from "@/app/settings/player/constants";
import { defaultSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/constants";
import { defaultWordSettings } from "@/app/settings/word/constants";
import { defaultGeneralSettings } from "@/lib/constants/settings";
import { GeneralSettings, PlayerSettings, SubtitleSettings, WordSettings } from "@/lib/db/schema";
import { SettingsForEpisode } from "@/types/settings";
import { create } from "zustand";

export type SettingsStore = {
  general: GeneralSettings;
  setGeneral: (settings: GeneralSettings) => void;

  player: PlayerSettings;
  setPlayer: (settings: PlayerSettings) => void;

  subtitle: SubtitleSettings;
  setSubtitle: (settings: SubtitleSettings) => void;

  word: WordSettings;
  setWord: (settings: WordSettings) => void;
  
  batchUpdate: (settings: SettingsForEpisode) => void;

  reset: () => void;
}

export const useSettingsStore = create<SettingsStore>()((set) => ({
  general: defaultGeneralSettings,
  setGeneral: (general) => set({ general }),
  
  player: defaultPlayerSettings,
  setPlayer: (player) => set({ player }),

  subtitle: defaultSubtitleSettings,
  setSubtitle: (subtitle) => set({ subtitle }),

  word: defaultWordSettings,
  setWord: (word) => set({ word }),

  batchUpdate: (settings) => set({
    general: settings.generalSettings,
    player: settings.playerSettings,
    subtitle: settings.subtitleSettings,
    word: settings.wordSettings,
  }),

  reset: () => set({
    general: defaultGeneralSettings,
    player: defaultPlayerSettings,
    subtitle: defaultSubtitleSettings,
    word: defaultWordSettings,
  }),
}));