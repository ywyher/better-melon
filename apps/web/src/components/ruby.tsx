import { defaultSubtitleStyles } from '@/components/subtitle/styles/constants';
import { usePlayerStore } from '@/lib/stores/player-store';
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
      margin: defaultSubtitleStyles.furigana.default.margin,
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
    
    let dynamicMargin = computedFuriganaStyle.text.margin;
    if(autoMargin) {
      dynamicMargin = Math.max(
        (isFullScreen ? 28 : 20),
        Number(computedFuriganaStyle.text.margin) / Number(computedFuriganaStyle.text.fontSize));
        console.log(`dynamicMargin`, dynamicMargin)
      computedFuriganaStyle.text.margin = dynamicMargin;
    }

    return {
      kanji: computedKanjiStyles,
      furigana: {
        ...computedFuriganaStyle,
        text: {
          ...computedFuriganaStyle.text,
          margin: `0 0 ${dynamicMargin}px 0`
        }
      },
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