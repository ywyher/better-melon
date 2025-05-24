import { defaultSubtitleStyles } from '@/components/subtitle/styles/constants';
import { SubtitleStyles } from '@/lib/db/schema';
import { create } from 'zustand';

export type SubtitleStylesStore = {
  // Now stores { default: SubtitleStyles, active: SubtitleStyles } for each transcription
  styles: Partial<Record<SubtitleStyles['transcription'], { default?: SubtitleStyles, active?: SubtitleStyles }>> | null;
  
  handleStyles: (
    transcription: SubtitleStyles['transcription'],
    updatedFields: Partial<SubtitleStyles>,
    state: SubtitleStyles['state']
  ) => void;
  
  ensureStylesExists: (
    transcription: SubtitleStyles['transcription'],
    state: SubtitleStyles['state']
  ) => SubtitleStyles;
  
  getStyles: (
    transcription: SubtitleStyles['transcription'],
    state: SubtitleStyles['state']
  ) => SubtitleStyles;
  
  deleteStyles: (
    transcription: SubtitleStyles['transcription'],
    state?: SubtitleStyles['state'] // Optional: delete specific state or entire transcription
  ) => void;
}

export const useSubtitleStylesStore = create<SubtitleStylesStore>()((set, get) => ({
  styles: null,
  
  ensureStylesExists: (transcription: SubtitleStyles['transcription'], state: SubtitleStyles['state']) => {
    const internalState = get();
    
    if (internalState.styles?.[transcription]?.[state]) {
      return internalState.styles[transcription][state] as SubtitleStyles;
    }
    
    const defaultStyle = state === 'default' ? defaultSubtitleStyles.default : defaultSubtitleStyles.active;
    
    set((internalState) => ({
      styles: {
        ...internalState.styles,
        [transcription]: {
          ...internalState.styles?.[transcription],
          [state]: defaultStyle
        }
      }
    }));
    
    return defaultStyle;
  },
  
  handleStyles: (
    transcription: SubtitleStyles['transcription'],
    updatedFields: Partial<SubtitleStyles>,
    state: SubtitleStyles['state']
  ) => {
    get().ensureStylesExists(transcription, state);
    
    set((internalState) => {
      if (!internalState.styles) return { styles: null };
      
      const currentStateStyle = internalState.styles[transcription]?.[state];
      
      return {
        styles: {
          ...internalState.styles,
          [transcription]: {
            ...internalState.styles[transcription],
            [state]: {
              ...currentStateStyle,
              ...updatedFields,
              updatedAt: new Date()
            }
          }
        }
      };
    });
  },
  
  getStyles: (transcription: SubtitleStyles['transcription'], state: SubtitleStyles['state']) => {
    const internalState = get();
    
    const existingStyle = internalState.styles?.[transcription]?.[state];
    if (existingStyle) {
      return existingStyle;
    }
    
    return state === 'default' ? defaultSubtitleStyles.default : defaultSubtitleStyles.active;
  },
  
  deleteStyles: (transcription: SubtitleStyles['transcription'], state?: SubtitleStyles['state']) => {
    set((internalState) => {
      if (!internalState.styles || !internalState.styles[transcription]) {
        return { styles: internalState.styles };
      }
      
      const newStylesMap = { ...internalState.styles };
      
      if (state) {
        const transcriptionStyles = { ...newStylesMap[transcription] };
        delete transcriptionStyles[state];
        
        if (Object.keys(transcriptionStyles).length === 0) {
          delete newStylesMap[transcription];
        } else {
          newStylesMap[transcription] = transcriptionStyles;
        }
      } else {
        delete newStylesMap[transcription];
      }
      
      return { styles: newStylesMap };
    });
  },
}));