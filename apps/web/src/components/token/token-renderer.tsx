import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { SubtitleToken, SubtitleCue, SubtitleTranscription } from '@/types/subtitle';
import { JapaneseToken } from '@/components/token/japanese-token';
import { RegularToken } from '@/components/token/regular-token';
import { PitchAccents } from '@/types/pitch';
import { useTokenStyles } from '@/lib/hooks/use-token-styles';
import { useSubtitleStylesStore } from '@/lib/stores/subtitle-styles-store';
import { computed } from 'better-auth/react';

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
  const { getStyles } = useTokenStyles();
  
  const isActive = useMemo(() => isTokenActive(cue.id, token.id), [isTokenActive, cue.id, token.id]);
  const accent = useMemo(() => getTokenAccent(token), [getTokenAccent, token]);

  const styles = useMemo(() => 
    getStyles({ token, isActive, accent, transcription }), 
    [getStyles, token, isActive, accent, transcription]
  );

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
        styles={styles}
        onTokenClick={handleClick}
        onTokenMouseEnter={handleMouseEnter}
        onTokenMouseLeave={onTokenMouseLeave}
      />
    );
  }

  return (
    <RegularToken
      token={token}
      styles={styles}
      transcription={transcription}
      onTokenClick={handleClick}
      onTokenMouseEnter={handleMouseEnter}
      onTokenMouseLeave={onTokenMouseLeave}
    />
  );
});

export default TokenRenderer;