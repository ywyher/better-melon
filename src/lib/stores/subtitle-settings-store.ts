import { subtitleSettingsSchema } from '@/app/settings/subtitle/types';
import { z } from 'zod';
import { create } from 'zustand'

type SubtitleSettings = Omit<z.infer<typeof subtitleSettingsSchema>, 'isGlobal'>

type SubtitleSettingsStore = {
  settings: Partial<Record<SubtitleSettings['transcription'], SubtitleSettings>> | null;
  getSettings: (transcription: SubtitleSettings['transcription']) => SubtitleSettings | null;
  addSettings: (transcription: SubtitleSettings['transcription'], settings: SubtitleSettings) => void;
  updateSettings: (transcription: SubtitleSettings['transcription'], settings: SubtitleSettings) => void;
  deleteSettings: (transcription: SubtitleSettings['transcription']) => void;
}

export const useSubtitleSettingsStore = create<SubtitleSettingsStore>()(
  (set, get) => ({
    settings: null,
    
    getSettings: (transcription: SubtitleSettings['transcription']) => {
      const state = get();
      return state.settings?.[transcription] || null;
    },
    
    addSettings: (transcription: SubtitleSettings['transcription'], settings: SubtitleSettings) => set((state) => {
      // If settings is null, initialize it as an empty object
      if (!state.settings) {
        return {
          settings: {
            [transcription]: settings
          }
        };
      }
      
      // Otherwise add to existing settings
      return {
        settings: {
          ...state.settings,
          [transcription]: settings
        }
      };
    }),
    
    updateSettings: (transcription: SubtitleSettings['transcription'], settings: SubtitleSettings) => set((state) => {
      // If settings is null or doesn't have this transcription type, initialize it
      if (!state.settings) {
        return {
          settings: {
            [transcription]: settings
          }
        };
      }
      
      if (!state.settings[transcription]) {
        return {
          settings: {
            ...state.settings,
            [transcription]: settings
          }
        };
      }
      
      // Update existing settings
      return {
        settings: {
          ...state.settings,
          [transcription]: {
            ...state.settings[transcription],
            ...settings
          }
        }
      };
    }),
    
    deleteSettings: (transcription: SubtitleSettings['transcription']) => set((state) => {
      // If settings is null or doesn't have this transcription, do nothing substantial
      if (!state.settings || !state.settings[transcription]) {
        return { settings: state.settings };
      }
      
      // Otherwise delete the specified transcription settings
      const newSettingsMap = { ...state.settings };
      delete newSettingsMap[transcription];
      return { settings: newSettingsMap };
    }),
  }),
);