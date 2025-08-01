import { StyleTranscription } from "@/app/watch/[id]/[ep]/types";
import { defaultSubtitleStyles } from "@/components/subtitle/styles/constants";
import { SubtitleStyles } from "@/lib/db/schema";
import { CSSProperties } from "react";

export const getTokenStyles = ({ shouldScaleFontDown, styles, transcription }: {
  shouldScaleFontDown: boolean, 
  styles: {
    active: Partial<SubtitleStyles>,
    default: Partial<SubtitleStyles>
  },
  transcription: StyleTranscription
}): { default: CSSProperties; active: CSSProperties } => {
  const defaultFontSize = shouldScaleFontDown 
   ? ((styles.default.fontSize || defaultSubtitleStyles[transcription].default.fontSize)/1.5)
   : styles.default.fontSize || defaultSubtitleStyles[transcription].default.fontSize;

  const defaultStyle: CSSProperties = {
    fontSize: defaultFontSize,
    fontFamily: styles.default.fontFamily || defaultSubtitleStyles[transcription].default.fontFamily,
    color: styles.default.textColor ||  defaultSubtitleStyles[transcription].default.textColor,
    opacity: styles.default.textOpacity ||  defaultSubtitleStyles[transcription].default.textOpacity,
    fontWeight: styles.default.fontWeight ||  defaultSubtitleStyles[transcription].default.fontWeight,
    transition: 'all 0.15s ease',
    cursor: 'pointer',
    textShadow: styles.default.textShadow === 'drop-shadow' 
      ? '1px 1px 2px rgba(0, 0, 0, 0.8)'
      : styles.default.textShadow === 'raised'
      ? '1px 1px 0px rgba(255, 255, 255, 0.8), -1px -1px 0px rgba(0, 0, 0, 0.3)'
      : styles.default.textShadow === 'depressed'
      ? '-1px -1px 0px rgba(255, 255, 255, 0.5), 1px 1px 1px rgba(0, 0, 0, 0.8)'
      : 'none',
      
    // WebkitTextStroke: styles.default.textShadow === 'outline'
    //   ? (shouldScaleFontDown ? '.5px black' : '.3px black') 
    //   : 'none',
  };
  
  const activeFontSize = shouldScaleFontDown 
    ? ((styles.active.fontSize || defaultSubtitleStyles[transcription].active.fontSize)/1.5)
    : styles.active.fontSize || defaultSubtitleStyles[transcription].active.fontSize;

  const activeStyle: CSSProperties = {
    fontSize: activeFontSize,
    fontFamily: styles.active.fontFamily || defaultSubtitleStyles[transcription].active.fontFamily,
    color: styles.active.textColor || defaultSubtitleStyles[transcription].active.textColor,
    opacity: styles.active.textOpacity || defaultSubtitleStyles[transcription].active.textOpacity,
    fontWeight: styles.active.fontWeight || defaultSubtitleStyles[transcription].active.fontWeight,
    cursor: 'pointer',
    textShadow: styles.active.textShadow === 'drop-shadow' 
      ? '1px 1px 2px rgba(0, 0, 0, 0.8)'
      : styles.active.textShadow === 'raised'
      ? '1px 1px 0px rgba(255, 255, 255, 0.8), -1px -1px 0px rgba(0, 0, 0, 0.3)'
      : styles.active.textShadow === 'depressed'
      ? '-1px -1px 0px rgba(255, 255, 255, 0.5), 1px 1px 1px rgba(0, 0, 0, 0.8)'
      : 'none',
      
    transition: 'all'
    // WebkitTextStroke: styles.active.textShadow === 'outline'
    //   ? (shouldScaleFontDown ? '.5px black' : '.3px black') 
    //   : 'none',
  };

  return {
    default: defaultStyle,
    active: activeStyle
  };
};

export const getContainerStyles = (styles: {
  active: Partial<SubtitleStyles>,
  default: Partial<SubtitleStyles>,
}): { default: CSSProperties; active: CSSProperties } => {
  const defaultStyles: CSSProperties = {
    display: "flex",
    backgroundColor: `color-mix(in oklab, ${styles.default.backgroundColor} ${(((styles.default.backgroundOpacity || 0) * 100))}%, transparent)`,
    backdropFilter: styles.default.backgroundBlur 
      ? `blur(${styles.default.backgroundBlur * 4}px)` 
      : 'none',
    borderRadius: styles.default.backgroundRadius 
      ? `${styles.default.backgroundRadius}px` 
      : '8px',
    padding: '1rem 1rem 0.5rem 1rem',
    marginBottom: "1rem",
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: styles.default.gap
  }

  const activeStyles: CSSProperties = {
    backgroundColor: `color-mix(in oklab, ${styles.active.backgroundColor} ${(((styles.active.backgroundOpacity || 0) * 100))}%, transparent)`,
    backdropFilter: styles.active.backgroundBlur 
      ? `blur(${styles.active.backgroundBlur * 4}px)` 
      : 'none',
    borderRadius: styles.active.backgroundRadius 
      ? `${styles.active.backgroundRadius}px` 
      : '8px',
    textAlign: 'center',
    width: 'fit-content',
    height: 'fit-content',
    gap: styles.active.gap
  }

  return {
    default: defaultStyles,
    active: activeStyles,
  };
};