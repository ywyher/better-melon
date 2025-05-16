import { defaultSubtitleStyles } from '@/components/subtitle/styles/constants';
import { SubtitleStyles } from '@/lib/db/schema';
import { create } from 'zustand';


export type SubtitleStylesStore = {
  styles: Partial<Record<SubtitleStyles['transcription'], SubtitleStyles>> | null;
  
  handleStyles: (
    transcription: SubtitleStyles['transcription'],
    updatedFields: Partial<SubtitleStyles>
  ) => void;
  
  ensureStylesExists: (
    transcription: SubtitleStyles['transcription']
  ) => SubtitleStyles;
  
  getStyles: (
    transcription: SubtitleStyles['transcription']
  ) => SubtitleStyles | null;
  
  deleteStyles: (
    transcription: SubtitleStyles['transcription']
  ) => void;
}

export const useSubtitleStylesStore = create<SubtitleStylesStore>()((set, get) => ({
  styles: null,
  
  ensureStylesExists: (transcription: SubtitleStyles['transcription']) => {
    const state = get();
    
    if (state.styles?.[transcription]) {
      return state.styles[transcription] as SubtitleStyles;
    }
    
    set((state) => ({
      styles: {
        ...state.styles,
        [transcription]: defaultSubtitleStyles
      }
    }));
    
    return defaultSubtitleStyles;
  },
  
  handleStyles: (
    transcription: SubtitleStyles['transcription'],
    updatedFields: Partial<SubtitleStyles>
  ) => {
    get().ensureStylesExists(transcription);
    
    set((state) => {
      if (!state.styles) return { styles: null };
      
      return {
        styles: {
          ...state.styles,
          [transcription]: {
            ...state.styles[transcription],
            ...updatedFields,
            updatedAt: new Date()
          }
        }
      };
    });
  },
  
  getStyles: (transcription: SubtitleStyles['transcription']) => {
    const state = get();
    return state.styles?.[transcription] || defaultSubtitleStyles;
  },
  
  deleteStyles: (transcription: SubtitleStyles['transcription']) => set((state) => {
    if (!state.styles || !state.styles[transcription]) {
      return { styles: state.styles };
    }
    
    const newStylesMap = { ...state.styles };
    delete newStylesMap[transcription];
    return { styles: newStylesMap };
  }),
}));