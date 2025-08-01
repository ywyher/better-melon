import { defaultSubtitleStyles } from '@/components/subtitle/styles/constants';
import { cn } from '@/lib/utils/utils';
import { useMediaState } from '@vidstack/react';
import React, { memo, useEffect, useMemo } from 'react';

interface RubyProps {
  kanji: string;
  furigana: string;
  showFurigana?: boolean;

  kanjiStyles?: Partial<{
    text: React.CSSProperties;
    container: React.CSSProperties
  }>;
  furiganaStyles?: Partial<{
    text: React.CSSProperties;
    container: React.CSSProperties
  }>;
  wrapperStyles?: React.CSSProperties

  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  
  className?: string;
  styles?: React.CSSProperties;
  autoMargin?: boolean
}

const DEFAULT_STYLES = {
  kanji: { 
    text: {
      fontSize: defaultSubtitleStyles.all.default.fontSize
    },
    container: {
      textAlign: 'center' as const
    }
  } as const,
  furigana: { 
    text: {
      margin: `0 0 ${defaultSubtitleStyles.furigana.default.margin}px 0`,
      fontSize: defaultSubtitleStyles.furigana.default.fontSize, 
    }, 
    container: {
      textAlign: 'center' as const
    }
  } as const,
  wrapper: { lineHeight: '1.5' } as const
} as const;

const Ruby = memo<RubyProps>(({
  kanji,
  furigana,
  showFurigana = true,
  
  kanjiStyles = {
    text: {},
    container: {}
  },
  furiganaStyles = {
    text: {},
    container: {}
  },
  wrapperStyles = {},
  
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
  styles,

  autoMargin = true,
}) => {
  const isFullScreen = useMediaState('fullscreen')

  const computedStyles = useMemo(() => {
    const hasKanjiStyles = Object.entries(kanjiStyles).length > 0;
    const hasFuriganaStyles = Object.entries(furiganaStyles).length > 0;
    
    if (!hasKanjiStyles && !hasFuriganaStyles) {
      return {
        kanji: DEFAULT_STYLES.kanji,
        furigana: DEFAULT_STYLES.furigana,
        wrapper: DEFAULT_STYLES.wrapper,
        isMinimal: true
      };
    }

    const computedFuriganaStyle = { 
      text: {
        ...DEFAULT_STYLES.furigana.text,
        ...furiganaStyles.text,
      },
      container: {
        ...DEFAULT_STYLES.furigana.container,
        ...furiganaStyles.container,
      }
    };
    
    const computedKanjiStyles = { 
      text: {
        ...DEFAULT_STYLES.kanji.text,
        ...kanjiStyles.text,
      },
      container: {
        ...kanjiStyles.container,
      }
    };

    const computedWrapperStyles = { 
      ...DEFAULT_STYLES.wrapper,
      ...wrapperStyles,
      ...styles,
    };
    
    if(autoMargin) {
      const dynamicMarginEm = Math.max(
        (isFullScreen ? 2 : 1),
        Number(computedFuriganaStyle.text.margin) / Number(computedFuriganaStyle.text.fontSize));
      computedFuriganaStyle.text.margin = `0 0 ${dynamicMarginEm}rem 0`;
    }

    return {
      kanji: computedKanjiStyles,
      furigana: computedFuriganaStyle,
      wrapper: computedWrapperStyles,
      isMinimal: false
    };
  }, [kanjiStyles, furiganaStyles, wrapperStyles, styles]);

  if (!kanji) return null;

  return (
    <ruby
      className={cn(
        className,
      )}
      style={{
        ...computedStyles.wrapper,
        lineHeight: 'calc(1 + var(10) / 1em)',
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div style={computedStyles.kanji.container}>
        <span style={computedStyles.kanji.text}>
          {kanji}
        </span>
      </div>
    
      <rp>(</rp>
    
      {furigana && showFurigana && (
        <rt
          style={{
            ...computedStyles.furigana.text,
            ...computedStyles.furigana.container,
          }}
        >
          {furigana}
        </rt>
      )}
      
      <rp>)</rp>
    </ruby>
  );
});

Ruby.displayName = 'Ruby';

export default Ruby;