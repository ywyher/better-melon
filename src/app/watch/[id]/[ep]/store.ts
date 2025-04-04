import { SubtitleScript, SubtitleFile } from "@/types/subtitle";
import { MediaPlayerInstance } from "@vidstack/react";
import { createRef, RefObject } from "react";
import { create } from "zustand";

export type WatchStore = {
  player: RefObject<MediaPlayerInstance | null>;
  setPlayer: (sub: WatchStore['player']) => void;
  activeSubtitleFile: SubtitleFile | null;
  setActiveSubtitleFile: (sub: WatchStore['activeSubtitleFile']) => void;
  englishSubtitleUrl: string | null;
  setEnglishSubtitleUrl: (sub: WatchStore['englishSubtitleUrl']) => void;
  activeScripts: SubtitleScript[];
  setActiveScripts: (sub: WatchStore['activeScripts']) => void;
  reset: () => void;
};

export const useWatchStore = create<WatchStore>()(
  (set) => ({
    player: createRef<MediaPlayerInstance>(),
    setPlayer: (player: WatchStore['player']) => set({ player }),
    activeSubtitleFile: null,
    setActiveSubtitleFile: (activeSubtitleFile: WatchStore['activeSubtitleFile']) => set({ activeSubtitleFile }),
    englishSubtitleUrl: null,
    setEnglishSubtitleUrl: (englishSubtitleUrl: WatchStore['englishSubtitleUrl']) => set({ englishSubtitleUrl }),
    activeScripts: ['japanese', 'english'],
    setActiveScripts: (activeScripts: WatchStore['activeScripts']) => set({ activeScripts }),
    reset: () => {
      set({
        activeSubtitleFile: null,
        englishSubtitleUrl: null,
        activeScripts: ['japanese', 'english'],
      });
    },
  }),
);