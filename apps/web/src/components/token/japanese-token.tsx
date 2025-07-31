import React, { memo, useMemo } from 'react';
import { Ruby, SubtitleToken } from '@/types/subtitle';
import { RubyText } from '@/components/ruby-text';
import { parseRuby } from '@/lib/utils/subtitle';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useTokenStyles } from '@/lib/hooks/use-token-styles';

interface JapaneseTokenProps {
  token: SubtitleToken;
  isActive: boolean;
  accent: any;
  onTokenClick: () => void;
  onTokenMouseEnter: () => void;
  onTokenMouseLeave: () => void;
}

const rubyPairsCache = new Map();

const getCachedRubyPairs = (surfaceForm: string): Ruby[] => {
  if (!rubyPairsCache.has(surfaceForm)) {
    rubyPairsCache.set(surfaceForm, parseRuby(surfaceForm, true));
  }
  return rubyPairsCache.get(surfaceForm);
};

export const JapaneseToken = memo<JapaneseTokenProps>(({
  token,
  isActive,
  accent,
  onTokenClick,
  onTokenMouseEnter,
  onTokenMouseLeave,
}) => {
  const showFurigana = useSettingsStore((settings) => settings.subtitle.showFurigana);
  const { getTokenStyles, getContainerStyles, getLearningStatusStyles } = useTokenStyles();
  
  const rubyPairs = useMemo(() => getCachedRubyPairs(token.surface_form), [token.surface_form]);
  
  const tokenStyle = useMemo(() => {
    return getTokenStyles({ isActive, accent, transcription: 'japanese' })
  },[getTokenStyles, isActive, accent]);

  const containerStyle = useMemo(() => {
    return getContainerStyles({ isActive, transcription: 'japanese' })
  }, [getContainerStyles, isActive]);

  const learningStatusStyle = useMemo(() => {
    return getLearningStatusStyles(token)
  }, [getLearningStatusStyles, token]);
  
  const baseBackgroundStyle = useMemo(() => 
    isActive ? containerStyle : { display: 'flex' }, 
    [isActive, containerStyle]
  );

  const rubyTextStyle = useMemo(() => getTokenStyles({
    isActive,
    accent,
    transcription: 'furigana'
  }), [getTokenStyles, isActive, accent])

  return (
    <div
      className='mr-2 cursor-pointer'
      style={learningStatusStyle}
      onClick={onTokenClick}
      onMouseEnter={onTokenMouseEnter}
      onMouseLeave={onTokenMouseLeave}
    >
      {rubyPairs.map((pair, pairIdx) => {
        const { baseText, rubyText } = pair;
        return (
          <RubyText
            key={`${token.id}-${pairIdx}`}
            baseText={baseText}
            rubyText={rubyText || ""}
            showFurigana={showFurigana}
            baseTextStyle={tokenStyle}
            rubyTextStyle={rubyTextStyle}
            baseBackgroundStyle={baseBackgroundStyle}
          />
        );
      })}
    </div>
  );
});