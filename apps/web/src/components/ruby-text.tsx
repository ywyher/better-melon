import React, { memo, useEffect, useMemo } from 'react';

interface RubyTextProps {
  baseText: string;
  rubyText?: string;
  showFurigana?: boolean;
  baseTextStyle?: React.CSSProperties;
  rubyTextStyle?: React.CSSProperties;
  baseBackgroundStyle?: React.CSSProperties;
  baseRubyBackgroundStyle?: React.CSSProperties;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// Pre-computed default styles to avoid recreation
const DEFAULT_STYLES = {
  base: { fontSize: '18px' } as const,
  ruby: { 
    fontSize: '14px', 
    textAlign: 'center' as const, 
    marginBottom: '5px' 
  } as const,
  container: { lineHeight: '1.5' } as const
} as const;

export const RubyText = memo<RubyTextProps>(({
  baseText,
  rubyText,
  showFurigana = true,
  baseTextStyle = {},
  rubyTextStyle = {},
  baseBackgroundStyle = {},
  baseRubyBackgroundStyle = {},
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
  style,
}) => {
  const computedStyles = useMemo(() => {
    const hasBaseStyle = Object.keys(baseTextStyle).length > 0;
    const hasRubyStyle = Object.keys(rubyTextStyle).length > 0;
    const hasBackgroundStyle = Object.keys(baseBackgroundStyle).length > 0;
    
    if (!hasBaseStyle && !hasRubyStyle && !hasBackgroundStyle) {
      return {
        baseStyle: DEFAULT_STYLES.base,
        rubyStyle: DEFAULT_STYLES.ruby,
        containerStyle: DEFAULT_STYLES.container,
        isMinimal: true
      };
    }

    const baseFontSize = hasBaseStyle ? (Number(baseTextStyle.fontSize) || 24) : 24;
    
    const computedRubyStyle = { 
      ...DEFAULT_STYLES.ruby, 
      ...rubyTextStyle,
    };
    
    // If rubyTextStyle has a margin shorthand, don't override marginBottom
    // Otherwise, set the dynamic marginBottom
    if (!('margin' in rubyTextStyle)) {
      const dynamicMargin = Math.max(baseFontSize * 0.5, 15);
      computedRubyStyle.margin = `0 0 ${dynamicMargin}px 0`;
    }

    return {
      baseStyle: hasBaseStyle ? baseTextStyle : DEFAULT_STYLES.base,
      rubyStyle: computedRubyStyle,
      containerStyle: hasBaseStyle ? {} : DEFAULT_STYLES.container,
      isMinimal: false
    };
  }, [baseTextStyle, rubyTextStyle, baseBackgroundStyle]);

  const finalContainerStyle = useMemo(() => ({
    ...computedStyles.containerStyle,
    ...style
  }), [computedStyles.containerStyle, style]);

  if (!baseText) return null;

  return (
    <ruby
      className={className}
      style={finalContainerStyle}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {Object.keys(baseBackgroundStyle).length > 0 ? (
        <div style={baseBackgroundStyle}>
          <span style={computedStyles.baseStyle}>
            {baseText}
          </span>
        </div>
      ) : (
        <span style={computedStyles.baseStyle}>
          {baseText}
        </span>
      )}
      
      <rp>(</rp>
    
      {rubyText && showFurigana && (
        <rt 
          style={computedStyles.rubyStyle}
        >
          {rubyText}
        </rt>
      )}
      
      <rp>)</rp>
    </ruby>
  );
});

RubyText.displayName = 'RubyText';