import React, { memo, useMemo } from 'react';
import { SubtitleToken, SubtitleTranscription } from '@/types/subtitle';
import { useTokenStyles } from '@/lib/hooks/use-token-styles';

interface RegularTokenProps {
  token: SubtitleToken;
  isActive: boolean;
  accent: any;
  transcription: SubtitleTranscription;
  onTokenClick: () => void;
  onTokenMouseEnter: () => void;
  onTokenMouseLeave: () => void;
}

export const RegularToken = memo<RegularTokenProps>(({
  token,
  isActive,
  accent,
  transcription,
  onTokenClick,
  onTokenMouseEnter,
  onTokenMouseLeave,
}) => {
  const { getTokenStyles, getContainerStyles } = useTokenStyles();
  
  const tokenStyle = useMemo(() => getTokenStyles({
    isActive, accent, transcription
  }), [getTokenStyles, isActive, accent]);

  const containerStyle = useMemo(() => getContainerStyles({
    isActive, transcription 
  }), [getContainerStyles, isActive]);

  const baseBackgroundStyle = useMemo(() => 
    isActive ? containerStyle : { display: 'flex' }, 
    [isActive, containerStyle]
  );

  return (
    <div style={baseBackgroundStyle}>
      <span
        style={tokenStyle}
        onClick={onTokenClick}
        onMouseEnter={onTokenMouseEnter}
        onMouseLeave={onTokenMouseLeave}
      >
        {token.surface_form}
      </span>
    </div>
  );
});