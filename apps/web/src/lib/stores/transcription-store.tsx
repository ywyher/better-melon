import { TranscriptionQuery, TranscriptionsLookup } from "@/app/watch/[id]/[ep]/types";
import { SubtitleTranscription } from "@/types/subtitle";
import { create } from "zustand";

export type TranscriptionStore = {
  transcriptions: TranscriptionQuery[] | null;
  setTranscriptions: (transcriptions: TranscriptionStore['transcriptions']) => void;

  transcriptionsLookup: TranscriptionsLookup;
  setTranscriptionsLookup: (transcriptionsLookup: TranscriptionStore['transcriptionsLookup']) => void;
  
  activeTranscriptions: SubtitleTranscription[];
  setActiveTranscriptions: (transcriptions: SubtitleTranscription[]) => void;

  batchUpdate: (updates: Partial<Omit<TranscriptionStore, 'setTranscriptions' | 'setTranscriptionsLookup' | 'setTranscriptionsStyles' | 'reset' | 'batchUpdate'>>) => void;
  reset: () => void;
};

export const useTranscriptionStore = create<TranscriptionStore>()((set) => ({
  transcriptions: null,
  setTranscriptions: (transcriptions) => set({ transcriptions }),
  
  transcriptionsLookup: new Map(),
  setTranscriptionsLookup: (transcriptionsLookup) => set({ transcriptionsLookup }),

  activeTranscriptions: ['japanese'],
  setActiveTranscriptions: (activeTranscriptions) => set({ activeTranscriptions }),
  
  batchUpdate: (updates) => set((state) => ({ ...state, ...updates })),
  reset: () => set({
    transcriptions: null,
    transcriptionsLookup: new Map(),
    activeTranscriptions: ['japanese'],
  }),
}));