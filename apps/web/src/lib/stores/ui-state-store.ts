import { EpisodesListViewMode } from "@/types/episode";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UIStateStore = {
  panelState: 'visible' | 'hidden';
  setPanelState: (state: 'visible' | 'hidden') => void;
  
  episodesListViewMode: EpisodesListViewMode;
  setEpisodesListViewMode: (mode: EpisodesListViewMode) => void;
  
  episodesListSpoilerMode: boolean;
  setEpisodesListSpoilerMode: (enabled: boolean) => void;
  
  reset: () => void;
};

export const useUIStateStore = create<UIStateStore>()(
  persist(
    (set) => ({
      panelState: 'visible',
      setPanelState: (panelState) => set({ panelState }),
      
      episodesListViewMode: 'image',
      setEpisodesListViewMode: (episodesListViewMode) => set({ episodesListViewMode }),
      
      episodesListSpoilerMode: false,
      setEpisodesListSpoilerMode: (episodesListSpoilerMode) => set({ episodesListSpoilerMode }),
      
      reset: () => set({
        panelState: 'visible',
        episodesListViewMode: 'image',
        episodesListSpoilerMode: false,
      }),
    }),
    {
      name: "ui-state",
      storage: createJSONStorage(() => localStorage),
    }
  )
);