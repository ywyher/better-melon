import { StyleTranscription, WordsLookup } from "@/app/watch/[id]/[ep]/types";
import { defaultSubtitleStyles } from "@/components/subtitle/styles/constants";
import { pitchAccentsStyles } from "@/lib/constants/pitch";
import { excludedPos, learningStatusesStyles } from "@/lib/constants/subtitle";
import { SubtitleStyles } from "@/lib/db/schema";
import { SubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { PitchAccents } from "@/types/pitch";
import { SubtitleToken } from "@/types/subtitle";
import { CSSProperties } from "react";

export const getBaseStyles = ({ state, transcription, styles }: {
  transcription: StyleTranscription;
  styles: SubtitleStylesStore['styles'];
  state: 'default' | 'active';
}): Partial<SubtitleStyles> => {
  return styles?.[transcription]?.[state]
    || styles?.['all']?.[state]
    || defaultSubtitleStyles[transcription][state];
}

export const createTextShadow = (shadowType: string | undefined, shouldScale: boolean): string => {
  if (!shadowType || shadowType === 'none') return 'none';
  
  const scale = shouldScale ? 0.67 : 1;
  
  switch (shadowType) {
    case 'drop-shadow':
      return `${1 * scale}px ${1 * scale}px ${2 * scale}px rgba(0, 0, 0, 0.8)`;
    case 'raised':
      return `${1 * scale}px ${1 * scale}px 0px rgba(255, 255, 255, 0.8), ${-1 * scale}px ${-1 * scale}px 0px rgba(0, 0, 0, 0.3)`;
    case 'depressed':
      return `${-1 * scale}px ${-1 * scale}px 0px rgba(255, 255, 255, 0.5), ${1 * scale}px ${1 * scale}px ${1 * scale}px rgba(0, 0, 0, 0.8)`;
    default:
      return 'none';
  }
}

export const getMargin = (transcription: StyleTranscription, margin: number): string => {
  return transcription === 'furigana' 
    ? `0 0 ${margin}px 0`
    : `0 ${margin}px`;
}

export const getLearningStatusStyles = ({ showLearningStatus, token, wordsLookup }: {
  token: SubtitleToken, wordsLookup: WordsLookup, showLearningStatus: boolean
}): CSSProperties => {
  if (!showLearningStatus) return {};
  if (excludedPos.some(p => p === token.pos)) return {};
  
  const word = wordsLookup.get(token.original_form);
  const status = word?.status || 'unknown';
  
  return learningStatusesStyles[status] || {};
}

  export const getTokenStyles = ({
    transcription,
    isActive,
    shouldScaleFontDown,
    accent,
    pitchColoring,
    styles
  }: {
    transcription: StyleTranscription;
    isActive: boolean
    shouldScaleFontDown: boolean 
    accent: PitchAccents
    pitchColoring: boolean
    styles: SubtitleStylesStore['styles']
  }): CSSProperties => {
    
    const baseStyles = getBaseStyles({
      transcription, 
      state: isActive ? 'active' : 'default',
      styles
    });

    const defaultStyles = getBaseStyles({
      transcription, 
      state: 'default',
      styles
    });
    
    const fontSize = shouldScaleFontDown 
      ? (baseStyles.fontSize || 24) / 1.5
      : baseStyles.fontSize || 24;

    let style: CSSProperties = {
      fontSize,
      fontFamily: baseStyles.fontFamily,
      color: baseStyles.textColor,
      opacity: baseStyles.textOpacity || 1,
      fontWeight: baseStyles.fontWeight,
      transition: 'all 0.15s ease',
      margin: getMargin(transcription, baseStyles.margin || defaultStyles.margin || 0),
      cursor: 'pointer',
      textShadow: createTextShadow(baseStyles.textShadow, shouldScaleFontDown),
    };

    // Apply pitch accent coloring (only when not active)
    if (pitchColoring && !isActive && accent) {
      style = { ...style, ...pitchAccentsStyles[accent] } ;
    }

    return style;
  }

  export const getContainerStyles = ({
    isActive,
    transcription,
    styles
  }: {
    transcription: StyleTranscription, 
    isActive: boolean
    styles: SubtitleStylesStore['styles']
  }): CSSProperties => {
    const baseStyles = getBaseStyles({
      transcription, 
      state: isActive ? 'active' : 'default',
      styles
    });
    
    const backgroundColor = baseStyles.backgroundColor || 'transparent';
    const backgroundOpacity = baseStyles.backgroundOpacity || 0;
    
    return {
      display: 'flex',
      backgroundColor: `color-mix(in oklab, ${backgroundColor} ${backgroundOpacity * 100}%, transparent)`,
      backdropFilter: baseStyles.backgroundBlur ? `blur(${baseStyles.backgroundBlur * 4}px)` : 'none',
      borderRadius: `${baseStyles.backgroundRadius || 8}px`,
      padding: isActive ? undefined : '.5rem 1rem',
      marginBottom: isActive ? undefined : '.5rem',
      flexWrap: 'wrap',
      justifyContent: 'center',
      textAlign: 'center',
      width: isActive ? 'fit-content' : undefined,
    };
  }

