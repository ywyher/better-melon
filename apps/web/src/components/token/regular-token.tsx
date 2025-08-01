import React, { memo } from 'react';
import { SubtitleToken, SubtitleTranscription } from '@/types/subtitle';
import { TokenStyles } from '@/lib/hooks/use-token-styles';

interface RegularTokenProps {
  token: SubtitleToken;
  styles: TokenStyles
  transcription: SubtitleTranscription
  onTokenClick: () => void;
  onTokenMouseEnter: () => void;
  onTokenMouseLeave: () => void;
}

export const RegularToken = memo<RegularTokenProps>(({
  token,
  styles,
  transcription,
  onTokenClick,
  onTokenMouseEnter,
  onTokenMouseLeave,
}) => {
  return (
    <div style={{
      ...styles.container,
    }}>
      <span
        style={{
          ...styles.token,
          ...(transcription != 'english' ? styles.learningStatus : undefined)
        }}
        onClick={onTokenClick}
        onMouseEnter={onTokenMouseEnter}
        onMouseLeave={onTokenMouseLeave}
      >
        {token.surface_form}
      </span>
    </div>
  );
});