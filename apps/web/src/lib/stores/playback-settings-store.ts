import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PlaybackSettingsStore = {
  autoPlay: boolean;
  setAutoPlay: (autoPlay: boolean) => void;
  
  autoSkip: boolean;
  setAutoSkip: (autoSkip: boolean) => void;
  
  autoNext: boolean;
  setAutoNext: (autoNext: boolean) => void;
  
  pauseOnCue: boolean;
  setPauseOnCue: (pauseOnCue: boolean) => void;
  
  reset: () => void;
};

export const usePlaybackSettingsStore = create<PlaybackSettingsStore>()(
  persist(
    (set) => ({
      autoPlay: false,
      setAutoPlay: (autoPlay) => set({ autoPlay }),
      
      autoSkip: false,
      setAutoSkip: (autoSkip) => set({ autoSkip }),
      
      autoNext: false,
      setAutoNext: (autoNext) => set({ autoNext }),
      
      pauseOnCue: false,
      setPauseOnCue: (pauseOnCue) => set({ pauseOnCue }),
      
      reset: () => set({
        autoPlay: false,
        autoSkip: false,
        autoNext: false,
        pauseOnCue: false,
      }),
    }),
    {
      name: "playback-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);