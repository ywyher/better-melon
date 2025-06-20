import { MediaPlayerInstance } from "@vidstack/react";
import { createRef, RefObject } from "react";
import { create } from "zustand";

export type PlayerStore = {
  player: RefObject<MediaPlayerInstance | null>;
  setPlayer: (player: PlayerStore['player']) => void;
  
  isVideoReady: boolean;
  setIsVideoReady: (isReady: boolean) => void;
  
  reset: () => void;
};

export const usePlayerStore = create<PlayerStore>()((set) => ({
  player: createRef<MediaPlayerInstance>(),
  setPlayer: (player) => set({ player }),
  
  isVideoReady: false,
  setIsVideoReady: (isVideoReady) => set({ isVideoReady }),
  
  reset: () => set({ isVideoReady: false }),
}));