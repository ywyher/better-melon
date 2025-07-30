import { SubtitleToken } from '@/types/subtitle';
import { create } from 'zustand'

type DefinitionStore = {
    position: {
        x: number;
        y: number
    };
    setPosition: (position: DefinitionStore['position']) => void;

    isExpanded: boolean;
    setIsExpanded: (isExpanded: DefinitionStore['isExpanded']) => void;

    sentences: {
        kanji: string | null;
        kana: string | null;
        english: string | null;
    };
    setSentences: (sentences: DefinitionStore['sentences']) => void;

    token: SubtitleToken | null;
    setToken: (token: DefinitionStore['token']) => void;

    isAddToAnki: boolean;
    setIsAddToAnki: (token: DefinitionStore['isAddToAnki']) => void;
}

export const useDefinitionStore = create<DefinitionStore>()(
    (set) => ({
        position: { x: 0, y: 0 },
        setPosition: (position: DefinitionStore['position']) => set({ position }),

        isExpanded: false,
        setIsExpanded: (isExpanded: DefinitionStore['isExpanded']) => set({ isExpanded }),

        sentences: {
            kanji: null,
            english: null,
            kana: null,
        },
        setSentences: (sentences: DefinitionStore['sentences']) => set({ sentences }),

        token: null,
        setToken: (token: DefinitionStore['token']) => set({ token }),

        isAddToAnki: true,
        setIsAddToAnki: (isAddToAnki: DefinitionStore['isAddToAnki']) => set({ isAddToAnki }),
    })
);