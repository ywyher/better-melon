import { TranscriptionQuery, TranscriptionsLookup, TranscriptionStyles } from "@/app/watch/[id]/[ep]/types";
import { defaultSubtitleStyles } from "@/components/subtitle/styles/constants";
import { getContainerStyles, getTokenStyles } from "@/lib/utils/styles";
import { SubtitleTranscription } from "@/types/subtitle";
import { create } from "zustand";

export type TranscriptionStore = {
  transcriptions: TranscriptionQuery[] | null;
  setTranscriptions: (transcriptions: TranscriptionStore['transcriptions']) => void;

  transcriptionsLookup: TranscriptionsLookup;
  setTranscriptionsLookup: (transcriptionsLookup: TranscriptionStore['transcriptionsLookup']) => void;
  
  activeTranscriptions: SubtitleTranscription[];
  setActiveTranscriptions: (transcriptions: SubtitleTranscription[]) => void;

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

  activeTranscriptions: ['japanese'],
  setActiveTranscriptions: (activeTranscriptions) => set({ activeTranscriptions }),
  
  transcriptionsStyles: {
    all: {
      tokenStyles: getTokenStyles({
        shouldScaleFontDown: false,
        styles: {
          active: defaultSubtitleStyles['all'].active,
          default: defaultSubtitleStyles['all'].default
        },
        transcription: 'all'
      }),
      containerStyle: getContainerStyles({
        active: defaultSubtitleStyles['all'].active,
        default: defaultSubtitleStyles['all'].default
      })
    }
  },
  setTranscriptionsStyles: (transcriptionsStyles) => set({ transcriptionsStyles }),

  batchUpdate: (updates) => set((state) => ({ ...state, ...updates })),
  reset: () => set({
    transcriptions: null,
    transcriptionsLookup: new Map(),
    activeTranscriptions: ['japanese'],
    transcriptionsStyles: {
      all: {
        tokenStyles: getTokenStyles({
          shouldScaleFontDown: false,
          styles: {
            active: defaultSubtitleStyles['all'].active,
            default: defaultSubtitleStyles['all'].default
          },
          transcription: 'all'
        }),
        containerStyle: getContainerStyles({
          active: defaultSubtitleStyles['all'].active,
          default: defaultSubtitleStyles['all'].default
        })
      }
    }
  }),
}));