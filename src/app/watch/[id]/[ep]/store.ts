import { SubtitleDisplayMode, SubtitleFile } from "@/types/subtitle";
import { MediaPlayerInstance } from "@vidstack/react";
import { createRef, RefObject } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WatchStore = {
  player: RefObject<MediaPlayerInstance | null>;
  setPlayer: (sub: WatchStore['player']) => void;
  activeSubtitleFile: SubtitleFile | null;
  setActiveSubtitleFile: (sub: WatchStore['activeSubtitleFile']) => void;
  activeModes: SubtitleDisplayMode[];
  setActiveModes: (sub: WatchStore['activeModes']) => void;
  reset: () => void;
};

export const useWatchStore = create<WatchStore>()(
  (set) => ({
    player: createRef<MediaPlayerInstance>(),
    setPlayer: (player: WatchStore['player']) => set({ player }),
    activeSubtitleFile: null,
    setActiveSubtitleFile: (activeSubtitleFile: WatchStore['activeSubtitleFile']) => set({ activeSubtitleFile }),
    activeModes: ['japanese'],
    setActiveModes: (activeModes: WatchStore['activeModes']) => set({ activeModes }),
    reset: () => {
      set({
        activeSubtitleFile: null,
        activeModes: ['japanese'],
      });
    },
  }),
);