import { EpisodesListViewMode } from "@/types/anime";
import { SubtitleTranscription, SubtitleCue, ActiveSubtitleFile } from "@/types/subtitle";
import { MediaPlayerInstance } from "@vidstack/react";
import { createRef, RefObject } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type MediaStore = {
  player: RefObject<MediaPlayerInstance | null>;
  setPlayer: (sub: MediaStore['player']) => void;

  activeSubtitleFile: ActiveSubtitleFile | null;
  setActiveSubtitleFile: (sub: MediaStore['activeSubtitleFile']) => void;

  englishSubtitleUrl: string | null;
  setEnglishSubtitleUrl: (sub: MediaStore['englishSubtitleUrl']) => void;

  activeTranscriptions: SubtitleTranscription[];
  setActiveTranscriptions: (sub: MediaStore['activeTranscriptions']) => void;

  subtitleCues: SubtitleCue[];
  setSubtitleCues: (sub: MediaStore['subtitleCues']) => void;

  activeTokenId: string | null;
  setActiveTokenId: (sub: MediaStore['activeTokenId']) => void;

  delay: {
    japanese: number;
    english: number;
  };
  setDelay: (sub: MediaStore['delay']) => void;
  
  autoPlay: boolean;
  setAutoPlay: (sub: MediaStore['autoPlay']) => void;

  autoSkip: boolean;
  setAutoSkip: (sub: MediaStore['autoSkip']) => void;

  autoNext: boolean;
  setAutoNext: (sub: MediaStore['autoNext']) => void;

  episodesListViewMode: EpisodesListViewMode;
  setEpisodesListViewMode: (sub: MediaStore['episodesListViewMode']) => void;

  episodesListSpoilerMode: boolean;
  setEpisodesListSpoilerMode: (sub: MediaStore['episodesListSpoilerMode']) => void;
  
  reset: () => void;
};

export const useMediaStore = create<MediaStore>()(
  persist(
    (set) => ({
      player: createRef<MediaPlayerInstance>(),
      setPlayer: (player: MediaStore['player']) => set({ player }),

      activeSubtitleFile: null,
      setActiveSubtitleFile: (activeSubtitleFile: MediaStore['activeSubtitleFile']) => set({ activeSubtitleFile }),

      englishSubtitleUrl: null,
      setEnglishSubtitleUrl: (englishSubtitleUrl: MediaStore['englishSubtitleUrl']) => set({ englishSubtitleUrl }),

      activeTranscriptions: ['japanese'],
      setActiveTranscriptions: (activeTranscriptions: MediaStore['activeTranscriptions']) => set({ activeTranscriptions }),
      
      subtitleCues: [],
      setSubtitleCues: (subtitleCues: MediaStore['subtitleCues']) => set({ subtitleCues }),

      activeTokenId: null,
      setActiveTokenId: (activeTokenId: MediaStore['activeTokenId']) => set({ activeTokenId }),

      delay: {
        japanese: 0,
        english: 0
      },
      setDelay: (delay: MediaStore['delay']) => set({ delay }),
      
      autoPlay: false,
      setAutoPlay: (autoPlay: MediaStore['autoPlay']) => set({ autoPlay }),

      autoSkip: false,
      setAutoSkip: (autoSkip: MediaStore['autoSkip']) => set({ autoSkip }),

      autoNext: false,
      setAutoNext: (autoNext: MediaStore['autoNext']) => set({ autoNext }),
      
      episodesListViewMode: 'image',
      setEpisodesListViewMode: (episodesListViewMode: MediaStore['episodesListViewMode']) => set({ episodesListViewMode }),

      episodesListSpoilerMode: false,
      setEpisodesListSpoilerMode: (episodesListSpoilerMode: MediaStore['episodesListSpoilerMode']) => set({ episodesListSpoilerMode }),

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