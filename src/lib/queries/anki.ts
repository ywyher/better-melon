import { getDefaultPreset, getPreset, getPresets } from "@/app/settings/anki/actions";
import { invokeAnkiConnect } from "@/lib/anki";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const anki = createQueryKeys('anki', {
    deckNames: () => ({
        queryKey: ['anki', 'deckNames'],
        queryFn: async () => await invokeAnkiConnect('deckNames', 6),
    }),
    modelNames: () => ({
        queryKey: ['anki', 'modelNames'],
        queryFn: async () => await invokeAnkiConnect('modelNames', 6),
    }),
    modelFieldNames: (selectedModel: string) => ({
        queryKey: ['anki', 'modelFieldNames', selectedModel],
        queryFn: async () => await invokeAnkiConnect('modelFieldNames', 6, { modelName: selectedModel }),
    }),
    presets: () => ({
        queryKey: ['anki', 'presets'],
        queryFn: async () => {
            const presets = await getPresets()
            return presets || []
        }
    }),
    preset: (selectedPreset: string) => ({
        queryKey: ['anki', 'preset', selectedPreset],
        queryFn: async () => {
            if(!selectedPreset || selectedPreset === "new") return null;
            const preset = await getPreset({ id: selectedPreset })
            return preset
        },
    }),
    defaultPreset: () => ({
        queryKey: ['anki', 'default-preset'],
        queryFn: async () => {
          return await getDefaultPreset()
        }
    })
})