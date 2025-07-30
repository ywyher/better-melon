import React, { memo, useCallback, useMemo } from 'react';
import { SubtitleToken, SubtitleCue } from '@/types/subtitle';
import { TranscriptionStyleSet } from '@/app/watch/[id]/[ep]/types';
import { JapaneseToken } from '@/components/token/japanese-token';
import { RegularToken } from '@/components/token/regular-token';
import { PitchAccents } from '@/types/pitch';

interface TokenRendererProps {
  cue: SubtitleCue;
  transcription: string;
  token: SubtitleToken;
  styles: TranscriptionStyleSet;
  furiganaStyles: TranscriptionStyleSet;
  onTokenClick: (cueId: number, token: SubtitleToken) => void;
  onTokenMouseEnter: (cueId: number, tokenId: string | number) => void;
  onTokenMouseLeave: () => void;
  isTokenActive: (cueId: number, tokenId: string | number) => boolean;
  getTokenAccent: (token: SubtitleToken) => PitchAccents | null;
  japaneseToken?: SubtitleToken;
}

const TokenRenderer = memo<TokenRendererProps>(({
  cue,
  transcription,
  styles,
  token,
  furiganaStyles,
  onTokenClick,
  onTokenMouseEnter,
  onTokenMouseLeave,
  isTokenActive,
  getTokenAccent,
  japaneseToken
}) => {
  const isActive = useMemo(() => isTokenActive(cue.id, token.id), [isTokenActive, cue.id, token.id]);
  const accent = useMemo(() => getTokenAccent(token), [getTokenAccent, token]);

  const handleClick = useCallback(() => onTokenClick(cue.id, japaneseToken || token), [onTokenClick, cue.id, japaneseToken, token]);
  const handleMouseEnter = useCallback(() => onTokenMouseEnter(cue.id, token.id), [onTokenMouseEnter, cue.id, token.id]);

  if (transcription === 'japanese') {
    return (
      <JapaneseToken
        token={token}
        isActive={isActive}
        accent={accent}
        styles={styles}
        furiganaStyles={furiganaStyles}
        onTokenClick={handleClick}
        onTokenMouseEnter={handleMouseEnter}
        onTokenMouseLeave={onTokenMouseLeave}
      />
    );
  }

  return (
    <RegularToken
      token={token}
      isActive={isActive}
      accent={accent}
      styles={styles}
      onTokenClick={handleClick}
      onTokenMouseEnter={handleMouseEnter}
      onTokenMouseLeave={onTokenMouseLeave}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.cue.id === nextProps.cue.id &&
    prevProps.token.id === nextProps.token.id &&
    prevProps.transcription === nextProps.transcription &&
    prevProps.styles === nextProps.styles &&
    prevProps.japaneseToken?.id === nextProps.japaneseToken?.id
  );
});

export default TokenRenderer;