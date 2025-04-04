import { SubtitleScript, SubtitleFile, SubtitleCue } from "@/types/subtitle";
import { MediaPlayerInstance } from "@vidstack/react";
import { createRef, RefObject } from "react";
import { create } from "zustand";

export type WatchStore = {
  player: RefObject<MediaPlayerInstance | null>;
  setPlayer: (sub: WatchStore['player']) => void;

  activeSubtitleFile: { source: "remote", file: SubtitleFile } | { source: "local", file: File } | null;
  setActiveSubtitleFile: (sub: WatchStore['activeSubtitleFile']) => void;

  englishSubtitleUrl: string | null;
  setEnglishSubtitleUrl: (sub: WatchStore['englishSubtitleUrl']) => void;

  activeScripts: SubtitleScript[];
  setActiveScripts: (sub: WatchStore['activeScripts']) => void;

  subtitleCues: SubtitleCue[];
  setSubtitleCues: (sub: WatchStore['subtitleCues']) => void;

  delay: {
    japanese: number;
    english: number;
  };
  setDelay: (sub: WatchStore['delay']) => void;

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

    subtitleCues: [],
    setSubtitleCues: (subtitleCues: WatchStore['subtitleCues']) => set({ subtitleCues }),

    delay: {
      japanese: 0,
      english: 0
    },
    setDelay: (delay: WatchStore['delay']) => set({ delay }),

    reset: () => {
      set({
        activeSubtitleFile: null,
        englishSubtitleUrl: null,
        activeScripts: ['japanese', 'english'],
        subtitleCues: [],
        delay: {
          japanese: 0,
          english: 0,
        },
      });
    },
  }),
);