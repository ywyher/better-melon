import React, { memo, useMemo } from 'react';
import { Ruby, SubtitleToken } from '@/types/subtitle';
import { TranscriptionStyleSet } from '@/app/watch/[id]/[ep]/types';
import { RubyText } from '@/components/ruby-text';
import { parseRuby } from '@/lib/utils/subtitle';
import { useWatchDataStore } from '@/lib/stores/watch-store';
import { useTokenStyles } from '@/lib/hooks/use-token-styles';

interface JapaneseTokenProps {
  token: SubtitleToken;
  isActive: boolean;
  accent: any;
  styles: TranscriptionStyleSet;
  furiganaStyles: TranscriptionStyleSet;
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
  styles,
  furiganaStyles,
  onTokenClick,
  onTokenMouseEnter,
  onTokenMouseLeave,
}) => {
  const showFurigana = useWatchDataStore((state) => state.settings.subtitleSettings.showFurigana);
  const { getTokenStyles, getContainerStyles, getLearningStatusStyles } = useTokenStyles();
  
  const rubyPairs = useMemo(() => getCachedRubyPairs(token.surface_form), [token.surface_form]);
  
  const tokenStyle = useMemo(() => getTokenStyles(isActive, accent, styles), [getTokenStyles, isActive, accent, styles]);
  const containerStyle = useMemo(() => getContainerStyles(isActive, styles), [getContainerStyles, isActive, styles]);
  const learningStatusStyle = useMemo(() => getLearningStatusStyles(token), [getLearningStatusStyles, token]);
  
  const baseTextStyle = tokenStyle;
  const baseBackgroundStyle = useMemo(() => 
    isActive ? containerStyle : { display: 'flex' }, 
    [isActive, containerStyle]
  );
  const rubyTextStyle = useMemo(() => 
    isActive ? furiganaStyles.tokenStyles.active : furiganaStyles.tokenStyles.default,
    [isActive, furiganaStyles.tokenStyles.active, furiganaStyles.tokenStyles.default]
  );

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
            baseTextStyle={baseTextStyle}
            rubyTextStyle={rubyTextStyle}
            baseBackgroundStyle={baseBackgroundStyle}
          />
        );
      })}
    </div>
  );
});