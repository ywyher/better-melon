import { SubtitleFile } from "@/types/subtitle";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WatchStore = {
  activeSubtitleFile: SubtitleFile | null;
  setActiveSubtitleFile: (sub: WatchStore['activeSubtitleFile']) => void;
  currentTime: number;
  setCurrentTime: (currentTime: WatchStore['currentTime']) => void;
  duration: number;
  setDuration: (duration: WatchStore['duration']) => void;
  reset: () => void;
};

export const useWatchStore = create<WatchStore>()(
  (set) => ({
    activeSubtitleFile: null,
    setActiveSubtitleFile: (activeSubtitleFile: WatchStore['activeSubtitleFile']) => set({ activeSubtitleFile }),
    currentTime: 0,
    setCurrentTime: (currentTime: WatchStore['currentTime']) => set({ currentTime }),
    duration: 0,
    setDuration: (duration: WatchStore['duration']) => set({ duration }),
    reset: () => {
      set({
        activeSubtitleFile: null,
        currentTime: 0,
        duration: 0,
      });
    },
  }),
);