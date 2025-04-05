import { SubtitleScript, SubtitleCue, ActiveSubtitleFile } from "@/types/subtitle";
import { MediaPlayerInstance } from "@vidstack/react";
import { createRef, RefObject } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WatchStore = {
  player: RefObject<MediaPlayerInstance | null>;
  setPlayer: (sub: WatchStore['player']) => void;

  activeSubtitleFile: ActiveSubtitleFile | null;
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
  
  autoPlay: boolean;
  setAutoPlay: (sub: WatchStore['autoPlay']) => void;

  autoSkip: boolean;
  setAutoSkip: (sub: WatchStore['autoSkip']) => void;

  autoNext: boolean;
  setAutoNext: (sub: WatchStore['autoNext']) => void;
  
  reset: () => void;
};

export const useWatchStore = create<WatchStore>()(
  persist(
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
      
      autoPlay: false,
      setAutoPlay: (autoPlay: WatchStore['autoPlay']) => set({ autoPlay }),

      autoSkip: false,
      setAutoSkip: (autoSkip: WatchStore['autoSkip']) => set({ autoSkip }),

      autoNext: false,
      setAutoNext: (autoNext: WatchStore['autoNext']) => set({ autoNext }),

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
          // Don't reset the persisted values
          // autoPlay: false, 
          // autoSkip: false,
          // autoNext: false,
        });
      },
    }),
    {
      name: "watch-settings", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({
        // only store these values
        autoPlay: state.autoPlay,
        autoSkip: state.autoSkip,
        autoNext: state.autoNext,
      }),
    }
  ),
);