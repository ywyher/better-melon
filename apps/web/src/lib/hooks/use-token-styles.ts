import { useCallback } from 'react';
import { useWatchDataStore } from '@/lib/stores/watch-store';
import { excludedPos, learningStatusesStyles } from '@/lib/constants/subtitle';
import { SubtitleToken } from '@/types/subtitle';
import { TranscriptionStyleSet } from '@/app/watch/[id]/[ep]/types';
import { pitchAccentsStyles } from '@/lib/constants/pitch';
import { PitchAccents } from '@/types/pitch';

export const useTokenStyles = () => {
  const pitchColoring = useWatchDataStore((state) => state.settings.wordSettings.pitchColoring);
  const learningStatus = useWatchDataStore((state) => state.settings.wordSettings.learningStatus);
  const wordsLookup = useWatchDataStore((state) => state.wordsLookup);

  const getTokenStyles = useCallback((isActive: boolean, accent: PitchAccents | null, styles: TranscriptionStyleSet) => {
    const baseStyle = isActive ? styles.tokenStyles.active : styles.tokenStyles.default;
    const pitchStyle = pitchColoring && !isActive && accent ? pitchAccentsStyles[accent] : undefined;
    
    return pitchStyle ? { ...baseStyle, ...pitchStyle } : baseStyle;
  }, [pitchColoring]);

  const getContainerStyles = useCallback((isActive: boolean, styles: TranscriptionStyleSet) => {
    return isActive ? styles.containerStyle.active : undefined;
  }, []);

  const getLearningStatusStyles = useCallback((token: SubtitleToken) => {
    const word = wordsLookup.get(token.original_form);
    const status = word?.status;
    
    if (learningStatus && !excludedPos.some(p => p === token.pos) && status) {
      return learningStatusesStyles[status];
    }
    
    if (!excludedPos.some(p => p === token.pos)) {
      return learningStatusesStyles['unknown'];
    }
    
    return {};
  }, [learningStatus, wordsLookup]);

  const getPitchStyles = useCallback((isActive: boolean, accent: PitchAccents | null) => {
    if(!accent) return;
    return isActive ? undefined :pitchAccentsStyles[accent]
  }, [pitchColoring])

  return {
    getTokenStyles,
    getContainerStyles,
    getLearningStatusStyles,
    getPitchStyles
  };
};