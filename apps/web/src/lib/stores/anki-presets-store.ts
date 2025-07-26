import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AnkiField = {
  name: string;
  value: "expression" | "sentence" | "image" | "definition"
}

export type AnkiPreset = {
  id: string;
  name: string;
  deckName: string;
  modelName: string;
  fields: AnkiField[];
  isDefault: boolean;
  isGui: boolean;
}

type AnkiPresetStore = {
  presets: AnkiPreset[];
  addPreset: (preset: AnkiPreset) => void;
  updatePreset: (id: string, preset: Partial<AnkiPreset>) => void;
  deletePreset: (id: string) => void;
  setDefaultPreset: (id: string) => void;
  getDefaultPreset: () => AnkiPreset | undefined;
}

export const useAnkiPresetStore = create<AnkiPresetStore>()(
  persist(
    (set, get) => ({
      presets: [],
      
      addPreset: (preset) => set((state) => {
        const newPreset = {
          ...preset,
          // If this is the first preset, make it default
          isDefault: state.presets.length === 0 ? true : preset.isDefault
        };
        
        // If new preset is default, make sure no other preset is default
        if (newPreset.isDefault) {
          const updatedPresets = state.presets.map(p => ({
            ...p,
            isDefault: false
          }));
          return { presets: [...updatedPresets, newPreset] };
        }
        
        return { presets: [...state.presets, newPreset] };
      }),
      
      updatePreset: (id, updatedPreset) => set((state) => {
        const updatedPresets = state.presets.map(preset => {
          if (preset.id === id) {
            return { ...preset, ...updatedPreset };
          }
          // If this preset is being set as default, ensure no other preset is default
          if (updatedPreset.isDefault && updatedPreset.isDefault === true) {
            return { ...preset, isDefault: preset.id === id };
          }
          return preset;
        });
        return { presets: updatedPresets };
      }),
      
      deletePreset: (id) => set((state) => {
        const filteredPresets = state.presets.filter(preset => preset.id !== id);
        // If we're deleting the default preset, make another one default if available
        const wasDefault = state.presets.find(p => p.id === id)?.isDefault;
        if (wasDefault && filteredPresets.length > 0) {
          filteredPresets[0].isDefault = true;
        }
        return { presets: filteredPresets };
      }),
      
      setDefaultPreset: (id) => set((state) => {
        const updatedPresets = state.presets.map(preset => ({
          ...preset,
          isDefault: preset.id === id
        }));
        return { presets: updatedPresets };
      }),
      
      getDefaultPreset: () => {
        const { presets } = get();
        return presets.find(preset => preset.isDefault);
      }
    }),
    {
      name: 'anki-presets',
    }
  )
);