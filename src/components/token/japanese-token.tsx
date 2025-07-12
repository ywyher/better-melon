import React from 'react';
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

export const JapaneseToken: React.FC<JapaneseTokenProps> = ({
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
  const rubyPairs = parseRuby(token.surface_form, true);
    
  const tokenStyle = getTokenStyles(isActive, accent, styles);
  const containerStyle = getContainerStyles(isActive, styles);
  const learningStatusStyle = getLearningStatusStyles(token);
  
  const baseTextStyle = tokenStyle;
  const baseBackgroundStyle = isActive ? containerStyle : { display: 'flex' };
  const rubyTextStyle = isActive 
    ? furiganaStyles.tokenStyles.active 
    : furiganaStyles.tokenStyles.default;

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
            key={`${pairIdx}-${pairIdx}`}
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
};