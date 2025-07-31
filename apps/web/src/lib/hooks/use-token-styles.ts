import { useCallback } from 'react';
import { excludedPos, learningStatusesStyles } from '@/lib/constants/subtitle';
import { SubtitleToken } from '@/types/subtitle';
import { StyleTranscription } from '@/app/watch/[id]/[ep]/types';
import { pitchAccentsStyles } from '@/lib/constants/pitch';
import { PitchAccents } from '@/types/pitch';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { wordSettings } from '@/lib/db/schema';
import { useLearningStore } from '@/lib/stores/learning-store';
import { useTranscriptionStore } from '@/lib/stores/transcription-store';

export const useTokenStyles = () => {
  const wordsSettings = useSettingsStore((settings) => settings.word);
  const wordsLookup = useLearningStore((state) => state.wordsLookup);
  const transcriptionsStyles = useTranscriptionStore((state) => state.transcriptionsStyles);
  
  const getTokenStyles = useCallback((
    { accent, isActive, transcription }: 
    { 
      isActive: boolean,
      accent: PitchAccents | null,
      transcription: StyleTranscription 
    }) => {
    const styles = transcriptionsStyles[transcription] 
      || transcriptionsStyles['all']
      
    const baseStyle = isActive 
      ? styles.tokenStyles.active 
      : styles.tokenStyles.default;

    const pitchStyle = wordsSettings.pitchColoring 
      && !isActive 
      && accent 
        ? pitchAccentsStyles[accent] 
        : undefined;
    
    return pitchStyle ? { ...baseStyle, ...pitchStyle } : baseStyle;
  }, [wordsSettings]);

  const getContainerStyles = useCallback(({ isActive, transcription }: { isActive: boolean, transcription: StyleTranscription }) => {
    const styles = transcriptionsStyles[transcription] 
      || transcriptionsStyles['all']
    return isActive 
      ? styles.containerStyle.active 
      : styles.containerStyle.default;
  }, []);

  const getLearningStatusStyles = useCallback((token: SubtitleToken) => {
    const word = wordsLookup.get(token.original_form);
    const status = word?.status;
    
    if (wordSettings.learningStatus && !excludedPos.some(p => p === token.pos) && status) {
      return learningStatusesStyles[status];
    }
    
    if (!excludedPos.some(p => p === token.pos)) {
      return learningStatusesStyles['unknown'];
    }
    
    return {};
  }, [wordSettings, wordsLookup]);

  const getPitchStyles = useCallback((isActive: boolean, accent: PitchAccents | null) => {
    if(!accent) return;
    return isActive ? undefined : pitchAccentsStyles[accent]
  }, [])

  return {
    getTokenStyles,
    getContainerStyles,
    getLearningStatusStyles,
    getPitchStyles,
  };
};