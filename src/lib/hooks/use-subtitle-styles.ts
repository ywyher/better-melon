import { defaultSubtitleStyles } from "@/components/subtitle/styles/constants";
import { TranscriptionStyles } from "@/app/watch/[id]/[ep]/types";
import { SubtitleStyles } from "@/lib/db/schema";
import { subtitleQueries } from "@/lib/queries/subtitle";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { SubtitleTranscription } from "@/types/subtitle";
import { useQuery } from "@tanstack/react-query";
import { useMediaState } from "@vidstack/react";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { Fullscreen } from "lucide-react";

export const getTokenStyles = (
  shouldScaleFontDown: boolean, 
  styles: {
    active: Partial<SubtitleStyles>,
    default: Partial<SubtitleStyles>
  }
): { default: CSSProperties; active: CSSProperties } => {
  const defaultFontSize = shouldScaleFontDown 
   ? ((styles.default.fontSize || defaultSubtitleStyles.default.fontSize)/1.5)
   : styles.default.fontSize || defaultSubtitleStyles.default.fontSize;

  const defaultStyle: CSSProperties = {
    fontSize: defaultFontSize,
    fontFamily: styles.default.fontFamily || defaultSubtitleStyles.default.fontFamily,
    color: styles.default.textColor ||  defaultSubtitleStyles.default.textColor,
    opacity: styles.default.textOpacity ||  defaultSubtitleStyles.default.textOpacity,
    fontWeight: styles.default.fontWeight ||  defaultSubtitleStyles.default.fontWeight,
    transition: 'all 0.15s ease',
    display: 'inline-block',
    margin: `0 ${styles.default.margin || defaultSubtitleStyles.default.margin}px`,
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
    ? ((styles.active.fontSize || defaultSubtitleStyles.active.fontSize)/1.5)
    : styles.active.fontSize || defaultSubtitleStyles.active.fontSize;

  const activeStyle: CSSProperties = {
    fontSize: activeFontSize,
    fontFamily: styles.active.fontFamily || defaultSubtitleStyles.active.fontFamily,
    color: styles.active.textColor || defaultSubtitleStyles.active.textColor,
    opacity: styles.active.textOpacity || defaultSubtitleStyles.active.textOpacity,
    fontWeight: styles.active.fontWeight || defaultSubtitleStyles.active.fontWeight,
    margin: `0 ${styles.active.margin || defaultSubtitleStyles.active.margin}px`,
    cursor: 'pointer',

    textShadow: styles.active.textShadow === 'drop-shadow' 
      ? '1px 1px 2px rgba(0, 0, 0, 0.8)'
      : styles.active.textShadow === 'raised'
      ? '1px 1px 0px rgba(255, 255, 255, 0.8), -1px -1px 0px rgba(0, 0, 0, 0.3)'
      : styles.active.textShadow === 'depressed'
      ? '-1px -1px 0px rgba(255, 255, 255, 0.5), 1px 1px 1px rgba(0, 0, 0, 0.8)'
      : 'none',
      
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
    backgroundColor: `color-mix(in oklab, ${styles.default.backgroundColor} ${(((styles.default.backgroundOpacity || 0) * 100))}%, transparent)`,
    backdropFilter: styles.default.backgroundBlur 
      ? `blur(${styles.default.backgroundBlur * 4}px)` 
      : 'none',
    borderRadius: styles.default.backgroundRadius 
      ? `${styles.default.backgroundRadius}px` 
      : '8px',
    padding: '.5rem 1rem',
    marginBottom: ".5rem",
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    textAlign: 'center',
    width: 'fit-content'
  }

  const activeStyles: CSSProperties = {
    backgroundColor: `color-mix(in oklab, ${styles.active.backgroundColor} ${(((styles.active.backgroundOpacity || 0) * 100))}%, transparent)`,
    backdropFilter: styles.active.backgroundBlur 
      ? `blur(${styles.active.backgroundBlur * 4}px)` 
      : 'none',
    borderRadius: styles.active.backgroundRadius 
      ? `${styles.active.backgroundRadius}px` 
      : '8px',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    textAlign: 'center',
    width: 'fit-content'
  }

  return {
    default: defaultStyles,
    active: activeStyles,
  };
};

export const useSubtitleStyles = () => {
  const activeTranscriptions = usePlayerStore((state) => state.activeTranscriptions);
  const panelState = usePlayerStore((state) => state.panelState)
  const isFullscreen = useMediaState('fullscreen', usePlayerStore((state) => state.player));
  
  const storeStyles = useSubtitleStylesStore((state) => state.styles);
  const handleSubtitleStylesInStore = useSubtitleStylesStore((state) => state.handleStyles);
  const getStylesFromStore = useSubtitleStylesStore((state) => state.getStyles);
  
  // Track loading duration
  const [loadingDuration, setLoadingDuration] = useState<number>(0);
  
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

  const shouldScaleFontDown = useMemo(() => {
    return !isFullscreen && panelState == 'visible'
    // return false;
  }, [isFullscreen, panelState])
  
  // Fetch styles from database only for transcriptions we haven't checked yet
  const stylesQuery = useQuery({
    ...subtitleQueries.styles({
      handleSubtitleStylesInStore,
      checkedTranscriptions,
      getStylesFromStore,
      setLoadingDuration,
      transcriptionsToFetch,
    }),
    staleTime: 1000 * 60 * 60,
    enabled: transcriptionsToFetch.length > 0,
    refetchOnWindowFocus: false
  });

  const styles = useMemo(() => {
    const start = performance.now();
    const result = {} as TranscriptionStyles;
    const defaultAllStyles = getStylesFromStore('all', 'default') || defaultSubtitleStyles.default;
    const activeAllStyles = getStylesFromStore('all', 'active') || defaultSubtitleStyles.active;

    if (!activeTranscriptions || activeTranscriptions.length === 0) {
      return { 
        all: {
          tokenStyles: getTokenStyles(shouldScaleFontDown, {
            active: activeAllStyles,
            default: defaultAllStyles
          }),
          containerStyle: getContainerStyles({
            active: activeAllStyles,
            default: defaultAllStyles
          })
        } 
      };
    }
    
    result.all = {
      tokenStyles: getTokenStyles(shouldScaleFontDown, {
        active: activeAllStyles,
        default: defaultAllStyles
      }),
      containerStyle: getContainerStyles({
        active: activeAllStyles,
        default: defaultAllStyles
      })
    };
    
    activeTranscriptions.forEach(transcription => {
      const defaultStyleData = getStylesFromStore(transcription, 'default');
      const activeStyleData = getStylesFromStore(transcription, 'active');

      if (
        defaultStyleData || activeStyleData
      ) {
        const hasCustomDefault = defaultStyleData && JSON.stringify(defaultStyleData) !== JSON.stringify(defaultSubtitleStyles.default);
        const hasCustomActive = activeStyleData && JSON.stringify(activeStyleData) !== JSON.stringify(defaultSubtitleStyles.active);
        
        if (hasCustomDefault || hasCustomActive) {
          result[transcription] = {
            tokenStyles: getTokenStyles(shouldScaleFontDown, {
              active: activeStyleData,
              default: defaultStyleData
            }),
            containerStyle: getContainerStyles({
              active: activeStyleData,
              default: defaultStyleData
            })
          };
        }
      }
    });
    
    const end = performance.now();
    console.info(`~Subtitle styles processed in ${(end - start).toFixed(2)}ms`);
    return result;
  }, [activeTranscriptions, isFullscreen, storeStyles, getStylesFromStore, shouldScaleFontDown]);

  return {
    isLoading: stylesQuery.isLoading,
    error: stylesQuery.error,
    styles: styles as TranscriptionStyles,
    loadingDuration
  };
};