import React, { memo, useMemo, CSSProperties } from 'react';
import { SubtitleToken, SubtitleTranscription } from '@/types/subtitle';
import { PitchAccents } from '@/types/pitch';
import { getTokenStyles, getContainerStyles, getLearningStatusStyles } from '@/lib/utils/styles';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useLearningStore } from '@/lib/stores/learning-store';
import { useTranscriptionStore } from '@/lib/stores/transcription-store';
import { useMediaState } from '@vidstack/react';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useUIStateStore } from '@/lib/stores/ui-state-store';
import { useSubtitleStylesStore } from '@/lib/stores/subtitle-styles-store';

interface BaseTokenProps {
  token: SubtitleToken;
  transcription: SubtitleTranscription;
  isActive: boolean;
  accent?: PitchAccents | null;
  onTokenClick: () => void;
  onTokenMouseEnter: () => void;
  onTokenMouseLeave: () => void;
  children: (styles: { 
    tokenStyle: CSSProperties; 
    containerStyle: CSSProperties; 
    learningStyle: CSSProperties 
  }) => React.ReactNode;
}

export const BaseToken = memo<BaseTokenProps>(({
  token,
  transcription,
  isActive,
  accent,
  onTokenClick,
  onTokenMouseEnter,
  onTokenMouseLeave,
  children
}) => {
  const styles = useSubtitleStylesStore((state) => state.styles);
  const wordsSettings = useSettingsStore((settings) => settings.word);
  const wordsLookup = useLearningStore((state) => state.wordsLookup);
  const panelState = useUIStateStore((state) => state.panelState);
  const isFullscreen = useMediaState('fullscreen', usePlayerStore((state) => state.player));
  
  const shouldScaleFontDown = !isFullscreen && panelState === 'visible';
  
  const calculatedStyles = useMemo(() => {
    const tokenStyle = getTokenStyles({
      transcription,
      isActive,
      shouldScaleFontDown,
      accent: accent || 'heiban', // Default accent if null
      pitchColoring: wordsSettings.pitchColoring,
      styles,
    });

    const containerStyle = getContainerStyles({
      transcription,
      isActive,
      styles,
    });

    const learningStyle = getLearningStatusStyles({
      token,
      wordsLookup,
      showLearningStatus: wordsSettings.learningStatus,
    });

    return { tokenStyle, containerStyle, learningStyle };
  }, [
    transcription, 
    isActive, 
    shouldScaleFontDown, 
    accent, 
    wordsSettings.pitchColoring, 
    wordsSettings.learningStatus,
    styles, 
    token, 
    wordsLookup
  ]);

  return (
    <div
      style={calculatedStyles.learningStyle}
      onClick={onTokenClick}
      onMouseEnter={onTokenMouseEnter}
      onMouseLeave={onTokenMouseLeave}
    >
      {children(calculatedStyles)}
    </div>
  );
});