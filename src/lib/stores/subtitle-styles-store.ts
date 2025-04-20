import { SubtitleStyles } from '@/lib/db/schema';
import { create } from 'zustand'

type SubtitleStylesStore = {
  styles: Partial<Record<SubtitleStyles['transcription'], SubtitleStyles>> | null;
  getStyles: (transcription: SubtitleStyles['transcription']) => SubtitleStyles | null;
  addStyles: (transcription: SubtitleStyles['transcription'], styles: SubtitleStyles) => void;
  updateStyles: (transcription: SubtitleStyles['transcription'], styles: Partial<SubtitleStyles>) => void;
  deleteStyles: (transcription: SubtitleStyles['transcription']) => void;
}

export const useSubtitleStylesStore = create<SubtitleStylesStore>()(
  (set, get) => ({
    styles: null,
    
    getStyles: (transcription: SubtitleStyles['transcription']) => {
      const state = get();
      return state.styles?.[transcription] || null;
    },
    
    addStyles: (transcription: SubtitleStyles['transcription'], styles: SubtitleStyles) => set((state) => {
      // If styles is null, initialize it as an empty object
      if (!state.styles) {
        return {
          styles: {
            [transcription]: styles
          }
        };
      }
      
      // Otherwise add to existing styles
      return {
        styles: {
          ...state.styles,
          [transcription]: styles
        }
      };
    }),
    
    updateStyles: (transcription: SubtitleStyles['transcription'], styles: Partial<SubtitleStyles>) => set((state) => {
      // If styles is null or doesn't have this transcription type, initialize it
      if (!state.styles) {
        return {
          styles: {
            [transcription]: styles
          }
        };
      }
      
      if (!state.styles[transcription]) {
        return {
          styles: {
            ...state.styles,
            [transcription]: styles
          }
        };
      }
      
      // Update existing styles
      return {
        styles: {
          ...state.styles,
          [transcription]: {
            ...state.styles[transcription],
            ...styles
          }
        }
      };
    }),
    
    deleteStyles: (transcription: SubtitleStyles['transcription']) => set((state) => {
      // If styles is null or doesn't have this transcription, do nothing substantial
      if (!state.styles || !state.styles[transcription]) {
        return { styles: state.styles };
      }
      
      // Otherwise delete the specified transcription styles
      const newStylesMap = { ...state.styles };
      delete newStylesMap[transcription];
      return { styles: newStylesMap };
    }),
  }),
);