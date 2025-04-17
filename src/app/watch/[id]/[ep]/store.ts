import { EpisodesListViewMode } from "@/types/anime";
import { SubtitleTranscription, SubtitleCue, ActiveSubtitleFile } from "@/types/subtitle";
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

  activeTranscriptions: SubtitleTranscription[];
  setActiveTranscriptions: (sub: WatchStore['activeTranscriptions']) => void;

  subtitleCues: SubtitleCue[];
  setSubtitleCues: (sub: WatchStore['subtitleCues']) => void;

  activeTokenId: string | null;
  setActiveTokenId: (sub: WatchStore['activeTokenId']) => void;

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

  episodesListViewMode: EpisodesListViewMode;
  setEpisodesListViewMode: (sub: WatchStore['episodesListViewMode']) => void;

  episodesListSpoilerMode: boolean;
  setEpisodesListSpoilerMode: (sub: WatchStore['episodesListSpoilerMode']) => void;
  
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

      activeTranscriptions: ['japanese'],
      setActiveTranscriptions: (activeTranscriptions: WatchStore['activeTranscriptions']) => set({ activeTranscriptions }),
      
      subtitleCues: [],
      setSubtitleCues: (subtitleCues: WatchStore['subtitleCues']) => set({ subtitleCues }),

      activeTokenId: null,
      setActiveTokenId: (activeTokenId: WatchStore['activeTokenId']) => set({ activeTokenId }),

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
      
      episodesListViewMode: 'image',
      setEpisodesListViewMode: (episodesListViewMode: WatchStore['episodesListViewMode']) => set({ episodesListViewMode }),

      episodesListSpoilerMode: false,
      setEpisodesListSpoilerMode: (episodesListSpoilerMode: WatchStore['episodesListSpoilerMode']) => set({ episodesListSpoilerMode }),

      reset: () => {
        set({
          activeSubtitleFile: null,
          englishSubtitleUrl: null,
          activeTranscriptions: ['japanese', 'english'],
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
        activeTranscriptions: state.activeTranscriptions,
        episodesListViewMode: state.episodesListViewMode,
        episodesListSpoilerMode: state.episodesListSpoilerMode
      }),
    }
  ),
);