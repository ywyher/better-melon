import { SubtitleTranscription, SubtitleCue, ActiveSubtitleFile } from "@/types/subtitle";
import { create } from "zustand";

export type SubtitleStore = {
  activeSubtitleFile: ActiveSubtitleFile | null;
  setActiveSubtitleFile: (file: ActiveSubtitleFile | null) => void;
  
  englishSubtitleUrl: string | null;
  setEnglishSubtitleUrl: (url: string | null) => void;
  
  activeTranscriptions: SubtitleTranscription[];
  setActiveTranscriptions: (transcriptions: SubtitleTranscription[]) => void;
  
  subtitleCues: SubtitleCue[];
  setSubtitleCues: (cues: SubtitleCue[]) => void;
  
  reset: () => void;
};

export const useSubtitleStore = create<SubtitleStore>()((set) => ({
  activeSubtitleFile: null,
  setActiveSubtitleFile: (activeSubtitleFile) => set({ activeSubtitleFile }),
  
  englishSubtitleUrl: null,
  setEnglishSubtitleUrl: (englishSubtitleUrl) => set({ englishSubtitleUrl }),
  
  activeTranscriptions: ["japanese"],
  setActiveTranscriptions: (activeTranscriptions) => set({ activeTranscriptions }),
  
  subtitleCues: [],
  setSubtitleCues: (subtitleCues) => set({ subtitleCues }),
  
  reset: () => set({
    activeSubtitleFile: null,
    englishSubtitleUrl: null,
    activeTranscriptions: ['japanese'],
    subtitleCues: [],
  }),
}));