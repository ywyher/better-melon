import { SubtitleFile } from "@/types/subtitle";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WatchStore = {
  activeSubtitleFile: SubtitleFile | null;
  setActiveSubtitleFile: (sub: WatchStore['activeSubtitleFile']) => void;
  reset: () => void;
};

export const useWatchStore = create<WatchStore>()(
  persist(
    (set) => ({
      activeSubtitleFile: null,
      setActiveSubtitleFile: (activeSubtitleFile: WatchStore['activeSubtitleFile']) => set({ activeSubtitleFile }),
      reset: () => {
        set({
          activeSubtitleFile: null,
        });
      },
    }),
    {
      name: "watch-store", // Name of the storage key
      storage: createJSONStorage(() => localStorage), // Use sessionStorage
    },
  ),
);