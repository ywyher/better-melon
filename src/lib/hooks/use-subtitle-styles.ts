import { defaultSubtitleStyles } from "@/components/subtitle/styles/constants";
import { StyleTranscription, TranscriptionStyles } from "@/app/watch/[id]/[ep]/types";
import { subtitleQueries } from "@/lib/queries/subtitle";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { useQuery } from "@tanstack/react-query";
import { useMediaState } from "@vidstack/react";
import { useMemo, useRef, useState } from "react";
import { getContainerStyles, getTokenStyles } from "@/lib/utils/styles";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { useUIStateStore } from "@/lib/stores/ui-state-store";

export const useSubtitleStyles = () => {
  const activeTranscriptions = useSubtitleStore((state) => state.activeTranscriptions);
  const panelState = useUIStateStore((state) => state.panelState)
  const isFullscreen = useMediaState('fullscreen', usePlayerStore((state) => state.player));
  
  const storeStyles = useSubtitleStylesStore((state) => state.styles);
  const handleSubtitleStylesInStore = useSubtitleStylesStore((state) => state.handleStyles);
  const getStylesFromStore = useSubtitleStylesStore((state) => state.getStyles);
  
  // Track loading duration
  const [loadingDuration, setLoadingDuration] = useState<number>(0);
  
  // Track which transcriptions have already been checked against the database
  const checkedTranscriptions = useRef<Set<StyleTranscription>>(new Set());
  
  // Determine which transcriptions need to be checked against the database
  const transcriptionsToFetch = useMemo(() => {
    if (!activeTranscriptions) return [];
    
    return ([...activeTranscriptions, 'furigana'] as StyleTranscription[]).filter(transcription => {
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

    ([...activeTranscriptions, "furigana"] as StyleTranscription[]).forEach(transcription => {
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
    return result;
  }, [activeTranscriptions, isFullscreen, storeStyles, getStylesFromStore, shouldScaleFontDown]);

  return {
    isLoading: stylesQuery.isLoading,
    error: stylesQuery.error,
    styles: styles as TranscriptionStyles,
    loadingDuration
  };
};