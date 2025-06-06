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

        isExpanded: true,
        setIsExpanded: (isExpanded: DefinitionStore['isExpanded']) => set({ isExpanded }),

        sentences: {
            kanji: null,
            english: null,
            kana: null,
        },
        setSentences: (sentences: DefinitionStore['sentences']) => set({ sentences }),

        token: {
            "word_id": 93180,
            "word_type": "KNOWN",
            "word_position": 14,
            "surface_form": "見る",
            "pos": "助詞",
            "pos_detail_1": "接続助詞",
            "pos_detail_2": "*",
            "pos_detail_3": "*",
            "conjugated_type": "*",
            "conjugated_form": "*",
            "basic_form": "が",
            "reading": "ガ",
            "pronunciation": "ガ",
            "id": "44-7"
            },
        setToken: (token: DefinitionStore['token']) => set({ token }),
        

        isAddToAnki: true,
        setIsAddToAnki: (isAddToAnki: DefinitionStore['isAddToAnki']) => set({ isAddToAnki }),
    })
);