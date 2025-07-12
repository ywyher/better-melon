import React from 'react';
import { SubtitleToken, SubtitleCue } from '@/types/subtitle';
import { TranscriptionStyleSet } from '@/app/watch/[id]/[ep]/types';
import { JapaneseToken } from '@/components/token/japanese-token';
import { RegularToken } from '@/components/token/regular-token';
import { parseRuby } from '@/lib/utils/subtitle';
import { PitchAccents } from '@/types/pitch';

interface TokenRendererProps {
  cue: SubtitleCue;
  transcription: string;
  styles: TranscriptionStyleSet;
  furiganaStyles: TranscriptionStyleSet;
  onTokenClick: (cueId: number, token: SubtitleToken) => void;
  onTokenMouseEnter: (cueId: number, tokenId: string | number) => void;
  onTokenMouseLeave: () => void;
  isTokenActive: (cueId: number, tokenId: string | number) => boolean;
  getTokenAccent: (token: SubtitleToken) => PitchAccents | null;
  japaneseTokens?: SubtitleToken[];
}

export default function TokenRenderer({
  cue,
  transcription,
  styles,
  furiganaStyles,
  onTokenClick,
  onTokenMouseEnter,
  onTokenMouseLeave,
  isTokenActive,
  getTokenAccent,
  japaneseTokens = []
}: TokenRendererProps) {
  if (!cue.tokens?.length) {
    return <span style={styles.tokenStyles.default}>{cue.content}</span>;
  }
  
  return (
    <>
      {cue.tokens.map((token, tokenIdx) => {
        const japaneseToken = japaneseTokens?.find((t) => t.id === token.id);
        const isActive = isTokenActive(cue.id, token.id);
        const accent = getTokenAccent(token);

        if (transcription === 'japanese') {
          return (
            <JapaneseToken
              key={tokenIdx}
              token={token}
              isActive={isActive}
              accent={accent}
              styles={styles}
              furiganaStyles={furiganaStyles}
              onTokenClick={() => onTokenClick(cue.id, token)}
              onTokenMouseEnter={() => onTokenMouseEnter(cue.id, token.id)}
              onTokenMouseLeave={onTokenMouseLeave}
            />
          );
        }

        return (
          <RegularToken
            key={`${token.id || tokenIdx}-${tokenIdx}`}
            token={token}
            isActive={isActive}
            accent={accent}
            styles={styles}
            onTokenClick={() => onTokenClick(cue.id, japaneseToken || token)}
            onTokenMouseEnter={() => onTokenMouseEnter(cue.id, token.id)}
            onTokenMouseLeave={onTokenMouseLeave}
          />
        );
      })}
    </>
  );
};
