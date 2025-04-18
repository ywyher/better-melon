import { SubtitleToken } from '@/types/subtitle';
import { create } from 'zustand'

type DefinitionStore = {
    sentance: string | null;
    setSentance: (sentance: DefinitionStore['sentance']) => void;

    token: SubtitleToken | null;
    setToken: (token: DefinitionStore['token']) => void;
}

export const useDefinitionStore = create<DefinitionStore>()(
    (set) => ({
        sentance: null,
        setSentance: (sentance: DefinitionStore['sentance']) => set({ sentance }),

        token: null,
        setToken: (token: DefinitionStore['token']) => set({ token }),
    })
);