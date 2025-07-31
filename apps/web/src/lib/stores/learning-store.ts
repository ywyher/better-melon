import { PitchLookup, WordsLookup } from "@/app/watch/[id]/[ep]/types";
import { create } from "zustand";

export type LearningStore = {
  pitchLookup: PitchLookup;
  setPitchLookup: (pitchLookup: LearningStore['pitchLookup']) => void;

  wordsLookup: WordsLookup;
  setWordsLookup: (wordsLookup: LearningStore['wordsLookup']) => void;

  batchUpdate: (updates: Partial<Omit<LearningStore, 'setPitchLookup' | 'setWordsLookup' | 'reset' | 'batchUpdate'>>) => void;
  reset: () => void;
}

export const useLearningStore = create<LearningStore>()((set) => ({
  pitchLookup: new Map(),
  setPitchLookup: (pitchLookup) => set({ pitchLookup }),

  wordsLookup: new Map(),
  setWordsLookup: (wordsLookup) => set({ wordsLookup }),

  batchUpdate: (updates) => set((state) => ({ ...state, ...updates })),
  reset: () => set({
    pitchLookup: new Map(),
    wordsLookup: new Map(),
  }),
}));