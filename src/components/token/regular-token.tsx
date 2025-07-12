import React from 'react';
import { Ruby, SubtitleToken } from '@/types/subtitle';
import { TranscriptionStyleSet } from '@/app/watch/[id]/[ep]/types';
import DOMPurify from 'dompurify';
import { useTokenStyles } from '@/lib/hooks/use-token-styles';

interface RegularTokenProps {
  token: SubtitleToken;
  isActive: boolean;
  accent: any;
  styles: TranscriptionStyleSet;
  onTokenClick: () => void;
  onTokenMouseEnter: () => void;
  onTokenMouseLeave: () => void;
}

export const RegularToken: React.FC<RegularTokenProps> = ({
  token,
  isActive,
  accent,
  styles,
  onTokenClick,
  onTokenMouseEnter,
  onTokenMouseLeave,
}) => {
  const { getTokenStyles, getContainerStyles } = useTokenStyles();
  
  const tokenStyle = getTokenStyles(isActive, accent, styles);
  const containerStyle = getContainerStyles(isActive, styles);

  return (
    <div
      style={isActive ? containerStyle : { display: 'flex' }}
    >
      <span
        style={tokenStyle}
        onClick={onTokenClick}
        onMouseEnter={onTokenMouseEnter}
        onMouseLeave={onTokenMouseLeave}
        onMouseOver={(e) => {
          if (!isActive) {
            Object.assign(e.currentTarget.style, styles.tokenStyles.active);
          }
        }}
        onMouseOut={(e) => {
          if (!isActive) {
            Object.assign(e.currentTarget.style, styles.tokenStyles.default);
          }
        }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(token.surface_form) }}
      />
    </div>
  );
};