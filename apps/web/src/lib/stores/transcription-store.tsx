import { TranscriptionQuery, TranscriptionsLookup, TranscriptionStyles } from "@/app/watch/[id]/[ep]/types";
import { defaultSubtitleStyles } from "@/components/subtitle/styles/constants";
import { getContainerStyles, getTokenStyles } from "@/lib/utils/styles";
import { create } from "zustand";

export type TranscriptionStore = {
  transcriptions: TranscriptionQuery[] | null;
  setTranscriptions: (transcriptions: TranscriptionStore['transcriptions']) => void;

  transcriptionsLookup: TranscriptionsLookup;
  setTranscriptionsLookup: (transcriptionsLookup: TranscriptionStore['transcriptionsLookup']) => void;
  
  transcriptionsStyles: TranscriptionStyles;
  setTranscriptionsStyles: (styles: TranscriptionStore['transcriptionsStyles']) => void;

  batchUpdate: (updates: Partial<Omit<TranscriptionStore, 'setTranscriptions' | 'setTranscriptionsLookup' | 'setTranscriptionsStyles' | 'reset' | 'batchUpdate'>>) => void;
  reset: () => void;
};

export const useTranscriptionStore = create<TranscriptionStore>()((set) => ({
  transcriptions: null,
  setTranscriptions: (transcriptions) => set({ transcriptions }),
  
  transcriptionsLookup: new Map(),
  setTranscriptionsLookup: (transcriptionsLookup) => set({ transcriptionsLookup }),
  
  transcriptionsStyles: {
    all: {
      tokenStyles: getTokenStyles(false, {
        active: defaultSubtitleStyles.active,
        default: defaultSubtitleStyles.default
      }),
      containerStyle: getContainerStyles({
        active: defaultSubtitleStyles.active,
        default: defaultSubtitleStyles.default
      })
    }
  },
  setTranscriptionsStyles: (transcriptionsStyles) => set({ transcriptionsStyles }),

  batchUpdate: (updates) => set((state) => ({ ...state, ...updates })),
  reset: () => set({
    transcriptions: null,
    transcriptionsLookup: new Map(),
    transcriptionsStyles: {
      all: {
        tokenStyles: getTokenStyles(false, {
          active: defaultSubtitleStyles.active,
          default: defaultSubtitleStyles.default
        }),
        containerStyle: getContainerStyles({
          active: defaultSubtitleStyles.active,
          default: defaultSubtitleStyles.default
        })
      }
    }
  }),
}));