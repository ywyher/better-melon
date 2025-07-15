import React, { memo, useMemo } from 'react';

interface RubyTextProps {
  baseText: string;
  rubyText?: string;
  showFurigana?: boolean;
  baseTextStyle?: React.CSSProperties;
  rubyTextStyle?: React.CSSProperties;
  baseBackgroundStyle?: React.CSSProperties;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const RubyText = memo<RubyTextProps>(({
  baseText,
  rubyText,
  showFurigana = true,
  baseTextStyle = {},
  rubyTextStyle = {},
  baseBackgroundStyle = {},
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
  style,
}) => {
  const styleCalculations = useMemo(() => {
    const isMinimal = (
      Object.keys(baseTextStyle).length === 0 && 
      Object.keys(rubyTextStyle).length === 0 && 
      Object.keys(baseBackgroundStyle).length === 0
    );

    const baseFontSize = Number(baseTextStyle.fontSize) || 24;
    const dynamicMargin = isMinimal ? 5 : Math.max(baseFontSize * 0.5, 10);

    const defaultBaseStyle: React.CSSProperties = {
      fontSize: '18px',
    };

    const defaultRubyStyle: React.CSSProperties = {
      fontSize: '14px',
      textAlign: 'center',
    };

    const finalBaseStyle = isMinimal ? defaultBaseStyle : baseTextStyle;
    const finalRubyStyle = isMinimal 
      ? { ...defaultRubyStyle, ...rubyTextStyle, marginBottom: `${dynamicMargin}px` }
      : { ...rubyTextStyle, marginBottom: `${dynamicMargin}px` };

    return {
      isMinimal,
      finalBaseStyle,
      finalRubyStyle
    };
  }, [baseTextStyle, rubyTextStyle, baseBackgroundStyle]);

  const { isMinimal, finalBaseStyle, finalRubyStyle } = styleCalculations;

  return (
    <ruby
      className={className}
      style={{
        lineHeight: isMinimal ? '1.5' : undefined,
        ...style
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div style={baseBackgroundStyle}>
        <span style={finalBaseStyle}>
          {baseText}
        </span>
      </div>
      
      <rp>(</rp>
      
      {(rubyText && showFurigana) && (
        <rt style={finalRubyStyle}>
          {rubyText}
        </rt>
      )}
      
      <rp>)</rp>
    </ruby>
  );
});