import { SubtitleToken } from '@/types/subtitle';
import { create } from 'zustand'

type InfoCardStore = {
    sentance: string | null;
    setSentance: (sentance: InfoCardStore['sentance']) => void;

    token: SubtitleToken | null;
    setToken: (token: InfoCardStore['token']) => void;
}

export const useInfoCardStore = create<InfoCardStore>()(
    (set) => ({
        sentance: null,
        setSentance: (sentance: InfoCardStore['sentance']) => set({ sentance }),

        token: null,
        setToken: (token: InfoCardStore['token']) => set({ token }),
    })
);