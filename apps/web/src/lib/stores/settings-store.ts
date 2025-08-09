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
  updateGeneral: (updates: Partial<GeneralSettings>) => void;

  player: PlayerSettings;
  setPlayer: (settings: PlayerSettings) => void;
  updatePlayer: (updates: Partial<PlayerSettings>) => void;

  subtitle: SubtitleSettings;
  setSubtitle: (settings: SubtitleSettings) => void;
  updateSubtitle: (updates: Partial<SubtitleSettings>) => void;

  word: WordSettings;
  setWord: (settings: WordSettings) => void;
  updateWord: (updates: Partial<WordSettings>) => void;
  
  batchUpdate: (settings: SettingsForEpisode) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  (set) => ({
    general: defaultGeneralSettings,
    setGeneral: (general) => set({ general }),
    updateGeneral: (updates) => set((state) => ({ 
      general: { ...state.general, ...updates } 
    })),
    
    player: defaultPlayerSettings,
    setPlayer: (player) => set({ player }),
    updatePlayer: (updates) => set((state) => ({ 
      player: { ...state.player, ...updates } 
    })),

    subtitle: defaultSubtitleSettings,
    setSubtitle: (subtitle) => set({ subtitle }),
    updateSubtitle: (updates) => set((state) => ({ 
      subtitle: { ...state.subtitle, ...updates } 
    })),

    word: defaultWordSettings,
    setWord: (word) => set({ word }),
    updateWord: (updates) => set((state) => ({ 
      word: { ...state.word, ...updates } 
    })),

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
  }),
)