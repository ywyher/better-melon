import { defaultSubtitleStyles } from '@/components/subtitle/styles/constants';
import { SubtitleStyles } from '@/lib/db/schema';
import { generateId } from 'better-auth';
import { create } from 'zustand';
import { getContainerStyles, getTokenStyles } from '@/lib/utils/styles';
import { StyleSet, StyleTranscription, TranscriptionStylesSet } from '@/app/watch/[id]/[ep]/types';

export type SubtitleStylesStore = {
  // Raw styles from database/defaults
  rawStyles: Partial<Record<StyleTranscription, Partial<StyleSet<SubtitleStyles>>>> | null;
  
  // Computed CSS styles - automatically managed
  computedStyles: Partial<Record<StyleTranscription, TranscriptionStylesSet>> | null;
  
  // Current scaling factor for recomputation
  shouldScaleFontDown: boolean;
  
  handleStyles: (
    transcription: StyleTranscription,
    updatedFields: Partial<SubtitleStyles>,
    state: SubtitleStyles['state']
  ) => void;
  
  ensureStylesExists: (
    transcription: StyleTranscription,
    state: SubtitleStyles['state']
  ) => SubtitleStyles;
  
  getRawStyles: (
    transcription: StyleTranscription,
    state: SubtitleStyles['state']
  ) => SubtitleStyles;
  
  getComputedStyles: (
    transcription: StyleTranscription
  ) => TranscriptionStylesSet | null;
  
  // Update scaling factor and recompute all styles
  updateScaling: (shouldScaleFontDown: boolean) => void;
  
  deleteStyles: (
    transcription: StyleTranscription,
    state?: SubtitleStyles['state']
  ) => void;
  
  // Internal helper to recompute styles for a transcription
  _recomputeStyles: (transcription: StyleTranscription) => void;
}

export const useSubtitleStylesStore = create<SubtitleStylesStore>()((set, get) => ({
  rawStyles: null,
  computedStyles: null,
  shouldScaleFontDown: false,
  
  ensureStylesExists: (transcription: StyleTranscription, state: SubtitleStyles['state']) => {
    const internalState = get();

    if (internalState.rawStyles?.[transcription]?.[state]) {
      return internalState.rawStyles[transcription][state] as SubtitleStyles;
    }
    
    const defaultStyle = state === 'default' ? defaultSubtitleStyles[transcription].default : defaultSubtitleStyles[transcription].active;
    const styleWithEdits = {
      ...defaultStyle,
      id: generateId(),
      transcription
    };
    
    set((internalState) => ({
      ...internalState,
      rawStyles: {
        ...internalState.rawStyles,
        [transcription]: {
          ...internalState.rawStyles?.[transcription],
          [state]: styleWithEdits,
        }
      }
    }));
    
    // Recompute after ensuring styles exist
    get()._recomputeStyles(transcription);
    
    return styleWithEdits;
  },

  handleStyles: (
    transcription: StyleTranscription,
    updatedFields: Partial<SubtitleStyles>,
    state: SubtitleStyles['state']
  ) => {
    get().ensureStylesExists(transcription, state);
    
    set((internalState) => {
      if (!internalState.rawStyles) return internalState;
      
      const currentStateStyle = internalState.rawStyles[transcription]?.[state];
      
      return {
        ...internalState,
        rawStyles: {
          ...internalState.rawStyles,
          [transcription]: {
            ...internalState.rawStyles[transcription],
            [state]: {
              ...currentStateStyle,
              ...updatedFields,
              updatedAt: new Date()
            }
          }
        }
      };
    });
    
    // Recompute after updating raw styles
    get()._recomputeStyles(transcription);
  },
  
  getRawStyles: (transcription: StyleTranscription, state: SubtitleStyles['state']) => {
    const internalState = get();
    
    const existingStyle = internalState.rawStyles?.[transcription]?.[state];
    if (existingStyle) {
      return existingStyle;
    }
    
    return state === 'default' ? defaultSubtitleStyles[transcription].default : defaultSubtitleStyles[transcription].active;
  },
  
  getComputedStyles: (transcription: StyleTranscription) => {
    const internalState = get();
    return internalState.computedStyles?.[transcription] || null;
  },
  
  updateScaling: (shouldScaleFontDown: boolean) => {
    const currentState = get();
    
    set((state) => ({
      ...state,
      shouldScaleFontDown
    }));
    
    // Recompute all existing computed styles
    if (currentState.rawStyles) {
      Object.keys(currentState.rawStyles).forEach(transcription => {
        get()._recomputeStyles(transcription as StyleTranscription);
      });
    }
  },
  
  deleteStyles: (transcription: StyleTranscription, state?: SubtitleStyles['state']) => {
    set((internalState) => {
      if (!internalState.rawStyles || !internalState.rawStyles[transcription]) {
        return internalState;
      }
      
      const newRawStylesMap = { ...internalState.rawStyles };
      const newComputedStyles = { ...internalState.computedStyles };
      
      if (state) {
        const transcriptionStyles = { ...newRawStylesMap[transcription] };
        delete transcriptionStyles[state];
        
        if (Object.keys(transcriptionStyles).length === 0) {
          delete newRawStylesMap[transcription];
          if (newComputedStyles) {
            delete newComputedStyles[transcription];
          }
        } else {
          newRawStylesMap[transcription] = transcriptionStyles;
          // Recompute since we still have some styles
          setTimeout(() => get()._recomputeStyles(transcription), 0);
        }
      } else {
        delete newRawStylesMap[transcription];
        if (newComputedStyles) {
          delete newComputedStyles[transcription];
        }
      }
      
      return { 
        ...internalState,
        rawStyles: newRawStylesMap,
        computedStyles: newComputedStyles
      };
    });
  },
  
  _recomputeStyles: (transcription: StyleTranscription) => {
    const currentState = get();
    
    const rawStyles = {
      default: currentState.rawStyles?.[transcription]?.default || defaultSubtitleStyles[transcription].default,
      active: currentState.rawStyles?.[transcription]?.active || defaultSubtitleStyles[transcription].active,
    };

    const tokenStyles = getTokenStyles({ 
      shouldScaleFontDown: currentState.shouldScaleFontDown, 
      styles: {
        default: rawStyles.default,
        active: rawStyles.active
      }, 
      transcription
    });
    
    const containerStyles = getContainerStyles({
      default: rawStyles.default,
      active: rawStyles.active
    });
    
    set((state) => ({
      ...state,
      computedStyles: {
        ...state.computedStyles,
        [transcription]: {
          token: tokenStyles,
          container: containerStyles,
        }
      }
    }));
  },
}));