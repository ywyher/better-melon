import React, { memo, useCallback, useMemo } from 'react';
import { SubtitleToken } from '@/types/subtitle';
import { TranscriptionStyleSet } from '@/app/watch/[id]/[ep]/types';
import { useTokenStyles } from '@/lib/hooks/use-token-styles';
import DOMPurify from 'dompurify';

interface RegularTokenProps {
  token: SubtitleToken;
  isActive: boolean;
  accent: any;
  styles: TranscriptionStyleSet;
  onTokenClick: () => void;
  onTokenMouseEnter: () => void;
  onTokenMouseLeave: () => void;
}

export const RegularToken = memo<RegularTokenProps>(({
  token,
  isActive,
  accent,
  styles,
  onTokenClick,
  onTokenMouseEnter,
  onTokenMouseLeave,
}) => {
  const { getTokenStyles, getContainerStyles } = useTokenStyles();
  
  const tokenStyle = useMemo(() => getTokenStyles(isActive, accent, styles), [getTokenStyles, isActive, accent, styles]);
  const containerStyle = useMemo(() => getContainerStyles(isActive, styles), [getContainerStyles, isActive, styles]);

  const handleMouseOver = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    if (!isActive) {
      Object.assign(e.currentTarget.style, styles.tokenStyles.active);
    }
  }, [isActive, styles.tokenStyles.active]);

  const handleMouseOut = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    if (!isActive) {
      Object.assign(e.currentTarget.style, styles.tokenStyles.default);
    }
  }, [isActive, styles.tokenStyles.default]);

  // const shouldUseDangerousHTML = useMemo(() => {
  //   // Use text content instead of dangerouslySetInnerHTML when possible
  //   return token.surface_form.includes('<') || token.surface_form.includes('&');
  // }, [token.surface_form]);

  return (
    <div style={isActive ? containerStyle : { display: 'flex' }}>
      <span
        style={tokenStyle}
        onClick={onTokenClick}
        onMouseEnter={onTokenMouseEnter}
        onMouseLeave={onTokenMouseLeave}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        {/* {shouldUseDangerousHTML ? (
          <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(token.surface_form) }} />
        ) : ( */}
          {token.surface_form}
        {/* )} */}
      </span>
    </div>
  );
});