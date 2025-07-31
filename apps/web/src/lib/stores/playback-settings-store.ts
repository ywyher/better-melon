import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PlaybackSettings = {
  autoPlay: boolean;
  autoSkip: boolean;
  autoNext: boolean;
  pauseOnCue: boolean;
};

export type PlaybackSettingsStore = PlaybackSettings & {
  setAutoPlay: (autoPlay: boolean) => void;
  setAutoSkip: (autoSkip: boolean) => void;
  setAutoNext: (autoNext: boolean) => void;
  setPauseOnCue: (pauseOnCue: boolean) => void;
  updateAll: (settings: Partial<PlaybackSettings>) => void;
  reset: () => void;
};

const defaultSettings: PlaybackSettings = {
  autoPlay: false,
  autoSkip: false,
  autoNext: false,
  pauseOnCue: false,
};

export const usePlaybackSettingsStore = create<PlaybackSettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      setAutoPlay: (autoPlay) => set({ autoPlay }),
      setAutoSkip: (autoSkip) => set({ autoSkip }),
      setAutoNext: (autoNext) => set({ autoNext }),
      setPauseOnCue: (pauseOnCue) => set({ pauseOnCue }),
      
      updateAll: (settings) => set((state) => ({ ...state, ...settings })),
      
      reset: () => set(defaultSettings),
    }),
    {
      name: "playback-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);