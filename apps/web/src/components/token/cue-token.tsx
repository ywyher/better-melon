import React, { useMemo } from 'react';
import { SubtitleToken } from '@/types/subtitle';
import { cn } from '@/lib/utils/utils';
import { parseRuby } from '@/lib/utils/subtitle';
import { RubyText } from '@/components/ruby-text';
import DOMPurify from 'dompurify';
import { useTokenStyles } from '@/lib/hooks/use-token-styles';
import { PitchAccents } from '@/types/pitch';

interface SubtitleCueTokenProps {
  token: SubtitleToken;
  index: number;
  transcription: string;
  isActive: boolean;
  showFurigana: boolean;
  accent: PitchAccents | null;
  onTokenClick: () => void;
}

export const CueToken: React.FC<SubtitleCueTokenProps> = ({
  token,
  index,
  transcription,
  isActive,
  showFurigana,
  accent,
  onTokenClick,
}) => {
  const {
    getPitchStyles,
    getLearningStatusStyles
  } = useTokenStyles();

  const pitchStyles = useMemo(() => 
    getPitchStyles(isActive, accent), 
    [getPitchStyles, isActive, accent]
  );
  
  const learningStatusStyles = useMemo(() => 
    getLearningStatusStyles(token), 
    [getLearningStatusStyles, token]
  );

  const className = useMemo(() => cn(
    "cursor-pointer mr-1 pb-2 transition-colors hover:bg-primary/10",
    isActive && "bg-primary/20"
  ), [isActive]);

  if (transcription === 'japanese') {
    const rubyPairs = parseRuby(token.surface_form);
    
    return (
      <div
        onClick={() => onTokenClick()}
      >
        {rubyPairs.map((pair, pairIdx) => {
          const { baseText, rubyText } = pair;
          return (
            <RubyText 
              key={pairIdx}
              baseText={baseText}
              rubyText={rubyText || ""}
              showFurigana={showFurigana}
              style={{
                ...pitchStyles,
                ...learningStatusStyles
              }}
              className={className}
            />
          )
        })}
      </div>
    );
  }
  
  return (
    <span
      key={index}
      className={className}
      style={{
        ...pitchStyles,
        ...learningStatusStyles
      }}
      onClick={() => onTokenClick()}
    >
      {token.surface_form}
    </span>
  );
};
