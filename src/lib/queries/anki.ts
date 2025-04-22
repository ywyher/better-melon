import { getDefaultPreset, getPreset, getPresets } from "@/app/settings/anki/actions";
import { invokeAnkiConnect } from "@/lib/anki";
import { AnkiPreset } from "@/lib/db/schema";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const ankiQueries = createQueryKeys('anki', {
    connection: () => ({
        queryKey: ['connection'],
        queryFn: async () => await invokeAnkiConnect('deckNames', 6),
    }),
    deckNames: () => ({
        queryKey: ['deckNames'],
        queryFn: async () => await invokeAnkiConnect('deckNames', 6),
    }),
    modelNames: () => ({
        queryKey: ['modelNames'],
        queryFn: async () => await invokeAnkiConnect('modelNames', 6),
    }),
    modelFieldNames: (selectedModel: string) => ({
        queryKey: ['modelFieldNames', selectedModel],
        queryFn: async () => await invokeAnkiConnect('modelFieldNames', 6, { modelName: selectedModel }),
    }),
    presets: () => ({
        queryKey: ['presets'],
        queryFn: async () => {
            const presets = await getPresets()
            return presets as AnkiPreset[] || []
        }
    }),
    preset: (selectedPreset: string) => ({
        queryKey: ['preset', selectedPreset],
        queryFn: async () => {
            if(!selectedPreset || selectedPreset === "new") return null;
            const preset = await getPreset({ id: selectedPreset })
            return preset as AnkiPreset
        },
    }),
    defaultPreset: () => ({
        queryKey: ['default-preset'],
        queryFn: async () => {
          return await getDefaultPreset() as AnkiPreset
        }
    })
})