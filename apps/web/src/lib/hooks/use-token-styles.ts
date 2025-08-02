// useTokenStyles.ts - Individual functions + combined function
import { CSSProperties, useCallback } from 'react';
import { excludedPos, learningStatusesStyles } from '@/lib/constants/subtitle';
import { SubtitleToken } from '@/types/subtitle';
import { StyleTranscription } from '@/app/watch/[id]/[ep]/types';
import { pitchAccentsStyles } from '@/lib/constants/pitch';
import { PitchAccents } from '@/types/pitch';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useLearningStore } from '@/lib/stores/learning-store';
import { useSubtitleStylesStore } from '@/lib/stores/subtitle-styles-store';
import { defaultSubtitleStyles } from '@/components/subtitle/styles/constants';

interface TokenStylesParams {
  token: SubtitleToken;
  isActive: boolean;
  accent: PitchAccents | null;
  transcription: StyleTranscription;
}

export interface TokenStyles {
  token: CSSProperties;
  container: CSSProperties;
  learningStatus?: CSSProperties;
  furigana?: {
    token: CSSProperties;
    container: CSSProperties
  };
}

export const useTokenStyles = () => {
  const wordSettings = useSettingsStore((settings) => settings.word);
  const wordsLookup = useLearningStore((state) => state.wordsLookup);
  const computedStyles = useSubtitleStylesStore((state) => state.computedStyles);

  const getTokenStyles = useCallback((
    { accent, isActive, transcription }: 
    { 
      isActive: boolean,
      accent: PitchAccents | null,
      transcription: StyleTranscription 
    }): CSSProperties => {
    let styles;
    if(transcription != 'furigana') {
      styles = computedStyles?.[transcription] || computedStyles?.['all'];
    } else {
      styles = computedStyles?.[transcription] || {
          ...computedStyles?.['all'],
          token: {
            active: {
              ...computedStyles?.['all']?.token.active,
              fontSize: defaultSubtitleStyles.furigana.active.fontSize
            },
            default: {
              ...computedStyles?.['all']?.token.default,
              fontSize: defaultSubtitleStyles.furigana.default.fontSize
            }
          }
        }
      }

    if (!styles?.token) return {};
      
    const baseStyle = isActive 
      ? styles.token.active 
      : styles.token.default;

    const pitchStyle = wordSettings.pitchColoring 
      && !isActive 
      && accent 
        ? pitchAccentsStyles[accent] 
        : undefined;
    
    return pitchStyle ? { ...baseStyle, ...pitchStyle } : baseStyle;
  }, [computedStyles, wordSettings]);

  const getContainerStyles = useCallback((
    { isActive, transcription }: 
    { 
      isActive: boolean, 
      transcription: StyleTranscription 
    }): CSSProperties => {
    const styles = computedStyles?.[transcription] || computedStyles?.['all'];
    
    if (!styles) return { display: '' };
    
    const containerStyle = isActive 
      ? styles.container.active 
      : styles.container.default;
    
    return isActive ? containerStyle : { display: '' };
  }, [computedStyles]);

  const getLearningStatusStyles = useCallback((token: SubtitleToken): CSSProperties => {
    const word = wordsLookup.get(token.original_form);
    const status = word?.status;
    const isExcludedPos = excludedPos.some(p => p === token.pos);
    
    if (wordSettings.learningStatus && !isExcludedPos && status) {
      return learningStatusesStyles[status];
    }
    
    if (!isExcludedPos) {
      return learningStatusesStyles['unknown'];
    }
    
    return {};
  }, [wordSettings, wordsLookup]);

  const getPitchStyles = useCallback((
    isActive: boolean, 
    accent: PitchAccents | null
  ): CSSProperties | undefined => {
    if (!accent || isActive) return undefined;
    return pitchAccentsStyles[accent];
  }, []);

  const getStyles = useCallback((params: TokenStylesParams): TokenStyles => {
    const { token, isActive, accent, transcription } = params;
    
    const tokenStyle = getTokenStyles({ isActive, accent, transcription });
    const containerStyle = getContainerStyles({ isActive, transcription });

    let learningStatusStyle = undefined;
    if(wordSettings.learningStatus) {
      learningStatusStyle = getLearningStatusStyles(token);
    }
    
    // Ruby text styles (for Japanese tokens)
    const furiganaStyle = transcription === 'japanese' 
      ? {
        token: getTokenStyles({ isActive, accent, transcription: 'furigana' }),
        container: getContainerStyles({ isActive, transcription: 'furigana' })
      }
      : undefined;

    return {
      token: tokenStyle,
      container: containerStyle,
      learningStatus: learningStatusStyle,
      furigana: furiganaStyle,
    };
  }, [getTokenStyles, getContainerStyles, getLearningStatusStyles, wordSettings]);

  return {
    getTokenStyles,
    getContainerStyles,
    getLearningStatusStyles,
    getPitchStyles,
    getStyles,
  };
};