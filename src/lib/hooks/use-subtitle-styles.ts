import { getAllSubtitleStyles, getMultipleTranscriptionsStyles } from "@/app/settings/subtitle/_subtitle-styles/actions";
import { defaultSubtitleStyles } from "@/app/settings/subtitle/_subtitle-styles/constants";
import { TranscriptionStyles, TranscriptionStyleSet } from "@/app/watch/[id]/[ep]/types";
import { SubtitleStyles } from "@/lib/db/schema";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { SubtitleTranscription } from "@/types/subtitle";
import { useQuery } from "@tanstack/react-query";
import { useMediaState } from "@vidstack/react";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

export const getTokenStyles = (
  isFullscreen: boolean, 
  styles: Partial<SubtitleStyles>
): { default: CSSProperties; active: CSSProperties } => {
  const fontSize = isFullscreen ? styles.fontSize || 24 : ((styles.fontSize || 24)/1.5);

  const defaultStyle: CSSProperties = {
    fontSize: fontSize,
    fontFamily: styles?.fontFamily || 'inherit',
    color: styles?.textColor || 'white',
    opacity: styles?.textOpacity || 1,
    WebkitTextStroke: styles?.textShadow === 'outline'
      ? (isFullscreen ? '.5px black' : '.3px black') 
      : 'none',
    fontWeight: 'bold',
    transition: 'all 0.15s ease',
    display: 'inline-block',
    textShadow: styles?.textShadow === 'drop-shadow' 
      ? '1px 1px 2px rgba(0, 0, 0, 0.8)'
      : 'none',
    margin: '0 2px',
    cursor: 'pointer',
  };
  
  const activeStyle: CSSProperties = {
    fontSize: fontSize,
    fontFamily: styles?.fontFamily || 'inherit',
    color: '#4ade80',
    opacity: styles?.textOpacity || 1,
    WebkitTextStroke: '1px black',
    fontWeight: 'bold',
    textShadow: '0 0 10px rgba(74, 222, 128, 0.8), 1px 1px 3px rgba(0, 0, 0, 0.9)',
    margin: '0 2px',
    cursor: 'pointer',
  };

  return {
    default: defaultStyle,
    active: activeStyle
  };
};

export const getContainerStyles = (styles: Partial<SubtitleStyles> | null): CSSProperties => {
  if (!styles) return {};
  
  return {
    backgroundColor: `color-mix(in oklab, ${styles.backgroundColor} ${(((styles.backgroundOpacity || 0) * 100))}%, transparent)`,
    backdropFilter: styles.backgroundBlur 
      ? `blur(${styles.backgroundBlur * 4}px)` 
      : 'none',
    borderRadius: styles.backgroundRadius 
      ? `${styles.backgroundRadius}px` 
      : '8px',
    padding: '.5rem 1rem',
    marginBottom: ".5rem",
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    textAlign: 'center',
    width: 'fit-content'
  };
};

export const useSubtitleStyles = () => {
  const activeTranscriptions = usePlayerStore((state) => state.activeTranscriptions);
  const isFullscreen = useMediaState('fullscreen', usePlayerStore((state) => state.player));
  const addSubtitleStylesInStore = useSubtitleStylesStore((state) => state.addStyles);
  const getStylesFromStore = useSubtitleStylesStore((state) => state.getStyles);
  const storeStyles = useSubtitleStylesStore((state) => state.styles);
  
  // Track loading duration
  const [loadingDuration, setLoadingDuration] = useState<number | null>(null);
  
  // Track which transcriptions have already been checked against the database
  const checkedTranscriptions = useRef<Set<SubtitleTranscription>>(new Set());
  
  // Determine which transcriptions need to be checked against the database
  const transcriptionsToFetch = useMemo(() => {
    if (!activeTranscriptions) return [];
    
    return activeTranscriptions.filter(transcription => {
      // Only check if we haven't already checked this transcription
      return !checkedTranscriptions.current.has(transcription);
    });
  }, [activeTranscriptions]);
  
  // Fetch styles from database only for transcriptions we haven't checked yet
  const stylesQuery = useQuery({
    queryKey: [
      'subtitle',
      'styles',
      transcriptionsToFetch,
    ],
    queryFn: async () => {
      if (transcriptionsToFetch.length === 0) return {};
      
      const start = performance.now();
      const stylesMap = await getMultipleTranscriptionsStyles(transcriptionsToFetch);
      
      // Store fetched styles in the Zustand store, but only for transcriptions
      // that actually have styles in the database
      Object.entries(stylesMap).forEach(([transcription, styles]) => {
        if (transcription !== 'all') {
          addSubtitleStylesInStore(transcription as SubtitleTranscription, styles);
        } else if (!getStylesFromStore('all')) {
          // Always store the 'all' style if we received it and don't have it yet
          addSubtitleStylesInStore('all', styles);
        }
      });
      
      // Mark all checked transcriptions, even those without styles
      transcriptionsToFetch.forEach(transcription => {
        checkedTranscriptions.current.add(transcription);
      });
      
      const end = performance.now();
      const duration = end - start;
      setLoadingDuration(duration);
      console.debug(`~Subtitle styles fetched and stored in ${duration.toFixed(2)}ms for ${transcriptionsToFetch.length} transcriptions`);
      
      return stylesMap;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: transcriptionsToFetch.length > 0
  });

  // Process styles from the store
  const styles = useMemo(() => {
    const start = performance.now();
    const result = {} as TranscriptionStyles;
    const allStyles = getStylesFromStore('all') || defaultSubtitleStyles;

    // Default return if no active transcriptions
    if (!activeTranscriptions || activeTranscriptions.length === 0) {
      return { 
        all: {
          tokenStyles: getTokenStyles(isFullscreen, allStyles),
          containerStyle: getContainerStyles(allStyles)
        } 
      };
    }
    
    // Always include the 'all' styles
    result.all = {
      tokenStyles: getTokenStyles(isFullscreen, allStyles),
      containerStyle: getContainerStyles(allStyles)
    };
    
    // Only include specific transcription styles if they exist in the store
    activeTranscriptions.forEach(transcription => {
      const styleData = getStylesFromStore(transcription);
      if (styleData) {
        result[transcription] = {
          tokenStyles: getTokenStyles(isFullscreen, styleData),
          containerStyle: getContainerStyles(styleData)
        };
      }
      // If no styles exist for this transcription, we don't add an entry
      // and the component will fall back to using 'all' styles
    });
    
    const end = performance.now();
    console.info(`~Subtitle styles processed in ${(end - start).toFixed(2)}ms`);
    return result;
  }, [activeTranscriptions, isFullscreen, storeStyles, getStylesFromStore]);

  return {
    isLoading: stylesQuery.isLoading,
    error: stylesQuery.error,
    styles: styles as TranscriptionStyles,
    loadingDuration
  };
};