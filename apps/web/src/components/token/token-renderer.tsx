import React, { memo, useCallback, useMemo } from 'react';
import { SubtitleToken, SubtitleCue, SubtitleTranscription } from '@/types/subtitle';
import { TranscriptionStyleSet } from '@/app/watch/[id]/[ep]/types';
import { JapaneseToken } from '@/components/token/japanese-token';
import { RegularToken } from '@/components/token/regular-token';
import { PitchAccents } from '@/types/pitch';

interface TokenRendererProps {
  cue: SubtitleCue;
  transcription: SubtitleTranscription;
  token: SubtitleToken;
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
  token,
  onTokenClick,
  onTokenMouseEnter,
  onTokenMouseLeave,
  isTokenActive,
  getTokenAccent,
  japaneseToken
}) => {
  const isActive = useMemo(() => {
    return isTokenActive(cue.id, token.id);
  }, [isTokenActive, cue.id, token.id]);
  const accent = useMemo(() => getTokenAccent(token), [getTokenAccent, token]);

  const handleClick = useCallback(() => {
    onTokenClick(cue.id, japaneseToken || token)
  }, [onTokenClick, cue.id, japaneseToken, token]);
  
  const handleMouseEnter = useCallback(() => {
    onTokenMouseEnter(cue.id, token.id)
  }, [onTokenMouseEnter, cue.id, token.id]);

  if (transcription === 'japanese') {
    return (
      <JapaneseToken
        token={token}
        isActive={isActive}
        accent={accent}
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
      transcription={transcription}
      onTokenClick={handleClick}
      onTokenMouseEnter={handleMouseEnter}
      onTokenMouseLeave={onTokenMouseLeave}
    />
  );
});

export default TokenRenderer;