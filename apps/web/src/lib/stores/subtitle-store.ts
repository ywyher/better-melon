import { SubtitleTranscription, SubtitleCue, ActiveSubtitleFile, SubtitleFile } from "@/types/subtitle";
import { create } from "zustand";

export type SubtitleStore = {
  activeSubtitleFile: ActiveSubtitleFile | null;
  setActiveSubtitleFile: (file: ActiveSubtitleFile | null) => void;
  
  englishSubtitleUrl: string | null;
  setEnglishSubtitleUrl: (url: string | null) => void;
  
  subtitleCues: SubtitleCue[];
  setSubtitleCues: (cues: SubtitleCue[]) => void;

  reset: () => void;
};

export const useSubtitleStore = create<SubtitleStore>()((set) => ({
  activeSubtitleFile: null,
  setActiveSubtitleFile: (activeSubtitleFile) => set({ activeSubtitleFile }),
  
  englishSubtitleUrl: null,
  setEnglishSubtitleUrl: (englishSubtitleUrl) => set({ englishSubtitleUrl }),
  
  subtitleCues: [],
  setSubtitleCues: (subtitleCues) => set({ subtitleCues }),
  
  reset: () => set({
    activeSubtitleFile: null,
    englishSubtitleUrl: null,
    subtitleCues: [],
  }),
}));