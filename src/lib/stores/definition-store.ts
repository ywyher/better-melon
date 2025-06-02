import { SubtitleToken } from '@/types/subtitle';
import { create } from 'zustand'

type DefinitionStore = {
    sentence: string | null;
    setSentence: (sentence: DefinitionStore['sentence']) => void;

    token: SubtitleToken | null;
    setToken: (token: DefinitionStore['token']) => void;

    definition: string | null;
    setDefinition: (defintion: DefinitionStore['definition']) => void;
    
    addToAnki: boolean;
    setAddToAnki: (token: DefinitionStore['addToAnki']) => void;
}

export const useDefinitionStore = create<DefinitionStore>()(
    (set) => ({
        sentence: null,
        setSentence: (sentence: DefinitionStore['sentence']) => set({ sentence }),

        token: null,
        setToken: (token: DefinitionStore['token']) => set({ token }),

        definition: null,
        setDefinition: (definition: DefinitionStore['definition']) => set({ definition }),

        addToAnki: true,
        setAddToAnki: (addToAnki: DefinitionStore['addToAnki']) => set({ addToAnki }),
    })
);