import { EpisodesListViewMode } from "@/types/anime";
import { SubtitleTranscription, SubtitleCue, ActiveSubtitleFile, SubtitleDelay } from "@/types/subtitle";
import { MediaPlayerInstance } from "@vidstack/react";
import { createRef, RefObject } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PlayerStore = {
  player: RefObject<MediaPlayerInstance | null>;
  setPlayer: (sub: PlayerStore['player']) => void;

  activeSubtitleFile: ActiveSubtitleFile | null;
  setActiveSubtitleFile: (sub: PlayerStore['activeSubtitleFile']) => void;

  englishSubtitleUrl: string | null;
  setEnglishSubtitleUrl: (sub: PlayerStore['englishSubtitleUrl']) => void;

  activeTranscriptions: SubtitleTranscription[];
  setActiveTranscriptions: (sub: PlayerStore['activeTranscriptions']) => void;

  subtitleCues: SubtitleCue[];
  setSubtitleCues: (sub: PlayerStore['subtitleCues']) => void;

  activeTokenId: string | null;
  setActiveTokenId: (sub: PlayerStore['activeTokenId']) => void;
  
  isVideoReady: boolean;
  setIsVideoReady: (sub: PlayerStore['isVideoReady']) => void;

  autoPlay: boolean;
  setAutoPlay: (sub: PlayerStore['autoPlay']) => void;

  autoSkip: boolean;
  setAutoSkip: (sub: PlayerStore['autoSkip']) => void;

  autoNext: boolean;
  setAutoNext: (sub: PlayerStore['autoNext']) => void;

  pauseOnCue: boolean;
  setPauseOnCue: (sub: PlayerStore['pauseOnCue']) => void;

  episodesListViewMode: EpisodesListViewMode;
  setEpisodesListViewMode: (sub: PlayerStore['episodesListViewMode']) => void;

  episodesListSpoilerMode: boolean;
  setEpisodesListSpoilerMode: (sub: PlayerStore['episodesListSpoilerMode']) => void;

  panelState: 'visible' | 'hidden';
  setPanelState: (state: PlayerStore['panelState']) => void;
  
  reset: () => void;
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      player: createRef<MediaPlayerInstance>(),
      setPlayer: (player: PlayerStore['player']) => set({ player }),

      activeSubtitleFile: null,
      setActiveSubtitleFile: (activeSubtitleFile: PlayerStore['activeSubtitleFile']) => set({ activeSubtitleFile }),

      englishSubtitleUrl: null,
      setEnglishSubtitleUrl: (englishSubtitleUrl: PlayerStore['englishSubtitleUrl']) => set({ englishSubtitleUrl }),

      activeTranscriptions: ['japanese'],
      setActiveTranscriptions: (activeTranscriptions: PlayerStore['activeTranscriptions']) => set({ activeTranscriptions }),
      
      subtitleCues: [],
      setSubtitleCues: (subtitleCues: PlayerStore['subtitleCues']) => set({ subtitleCues }),

      activeTokenId: null,
      setActiveTokenId: (activeTokenId: PlayerStore['activeTokenId']) => set({ activeTokenId }),

      isVideoReady: false,
      setIsVideoReady: (isVideoReady: PlayerStore['isVideoReady']) => set({ isVideoReady }),
      
      autoPlay: false,
      setAutoPlay: (autoPlay: PlayerStore['autoPlay']) => set({ autoPlay }),

      autoSkip: false,
      setAutoSkip: (autoSkip: PlayerStore['autoSkip']) => set({ autoSkip }),

      autoNext: false,
      setAutoNext: (autoNext: PlayerStore['autoNext']) => set({ autoNext }),
      
      pauseOnCue: false,
      setPauseOnCue: (pauseOnCue: PlayerStore['pauseOnCue']) => set({ pauseOnCue }),
      
      episodesListViewMode: 'image',
      setEpisodesListViewMode: (episodesListViewMode: PlayerStore['episodesListViewMode']) => set({ episodesListViewMode }),

      episodesListSpoilerMode: false,
      setEpisodesListSpoilerMode: (episodesListSpoilerMode: PlayerStore['episodesListSpoilerMode']) => set({ episodesListSpoilerMode }),

      panelState: 'visible',
      setPanelState: (panelState: PlayerStore['panelState']) => set({ panelState }),

      reset: () => {
        set({
          activeSubtitleFile: null,
          englishSubtitleUrl: null,
          activeTranscriptions: ['japanese', 'english'],
          subtitleCues: [],
          isVideoReady: false,
          autoPlay: false, 
          autoSkip: false,
          autoNext: false,
          panelState: 'visible'
        });
      },
    }),
    {
      name: "watch-settings", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({
        // only store these values
        episodesListViewMode: state.episodesListViewMode,
        episodesListSpoilerMode: state.episodesListSpoilerMode,
        panelState: state.panelState
      }),
    }
  ),
);