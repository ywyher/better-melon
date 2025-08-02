import React, { useMemo } from 'react';
import { SubtitleToken } from '@/types/subtitle';
import { cn } from '@/lib/utils/utils';
import { parseRuby } from '@/lib/utils/subtitle';
import Ruby from '@/components/ruby';
import { useTokenStyles } from '@/lib/hooks/use-token-styles';
import { PitchAccents } from '@/types/pitch';
import { useSettingsStore } from '@/lib/stores/settings-store';

interface SubtitleCueTokenProps {
  token: SubtitleToken;
  transcription: string;
  isActive: boolean;
  showFurigana: boolean;
  accent: PitchAccents | null;
  onTokenClick: () => void;
}

export const CueToken = React.memo<SubtitleCueTokenProps>(({
  token,
  transcription,
  isActive,
  showFurigana,
  accent,
  onTokenClick,
}) => {
  const wordsSettings = useSettingsStore((settings) => settings.word);
  const {
    getPitchStyles,
    getLearningStatusStyles
  } = useTokenStyles();

  const styles = useMemo(() => ({
    pitch: getPitchStyles(isActive, accent),
    learning: wordsSettings.learningStatus ? getLearningStatusStyles(token) : undefined
  }), [getPitchStyles, isActive, accent, getLearningStatusStyles, token]);

  const rubyPairs = useMemo(() => {
    if (transcription === 'japanese') {
      return parseRuby(token.surface_form);
    }
    return null;
  }, [token.surface_form, transcription]);

  const className = useMemo(() => cn(
    "cursor-pointer transition-colors hover:bg-primary/10",
    isActive && "bg-primary/20"
  ), [isActive]);

  if (transcription === 'japanese' && rubyPairs) {
    return (
      <div 
        onClick={onTokenClick}
        className='flex flex-row items-end cursor-pointer'
      >
        {rubyPairs.map((pair, pairIdx) => (
          <Ruby
            key={pairIdx}
            kanji={pair.kanji}
            furigana={pair.furigana || ""}
            showFurigana={showFurigana}

            kanjiStyles={{
              text: {
                fontSize: 19
              },
              container: {
                ...styles.learning
              }
            }}
            furiganaStyles={{
              text: {
                fontSize: 17,
              }
            }}
            styles={{
              ...styles.pitch,
            }}
            className={className}
          />
        ))}
      </div>
    );
  }
  
  return (
    <span
      className={className}
      style={{
        ...styles.pitch,
        ...styles.learning
      }}
      onClick={onTokenClick}
    >
      {token.surface_form}
    </span>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.token.id === nextProps.token.id &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.showFurigana === nextProps.showFurigana &&
    prevProps.accent === nextProps.accent &&
    // compare transcription and token content
    prevProps.transcription === nextProps.transcription &&
    prevProps.token.surface_form === nextProps.token.surface_form
  );
});