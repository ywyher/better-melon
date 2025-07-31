import { defaultSubtitleStyles } from "@/components/subtitle/styles/constants";
import { StyleTranscription, TranscriptionStyles } from "@/app/watch/[id]/[ep]/types";
import { subtitleQueries } from "@/lib/queries/subtitle";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { useQuery } from "@tanstack/react-query";
import { useMediaState } from "@vidstack/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getContainerStyles, getTokenStyles } from "@/lib/utils/styles";
import { useUIStateStore } from "@/lib/stores/ui-state-store";
import { useTranscriptionStore } from "@/lib/stores/transcription-store";

export const useSubtitleStyles = () => {
  const activeTranscriptions = useTranscriptionStore((state) => state.activeTranscriptions);
  const panelState = useUIStateStore((state) => state.panelState)
  const isFullscreen = useMediaState('fullscreen', usePlayerStore((state) => state.player));
  
  const handleSubtitleStylesInStore = useSubtitleStylesStore((state) => state.handleStyles);
  
  // Track loading duration
  const [loadingDuration, setLoadingDuration] = useState<number>(0);
  
  // Track which transcriptions have already been checked against the database
  const checkedTranscriptions = useRef<Set<StyleTranscription>>(new Set());
  
  // Determine which transcriptions need to be checked against the database
  const transcriptionsToFetch = useMemo(() => {
    if (!activeTranscriptions) return [];
    
    if(activeTranscriptions.some(t => t == 'japanese')) {
      return ([...activeTranscriptions, 'furigana'] as StyleTranscription[]).filter(transcription => {
        return !checkedTranscriptions.current.has(transcription);
      });
    } else {
      return ([...activeTranscriptions] as StyleTranscription[]).filter(transcription => {
        return !checkedTranscriptions.current.has(transcription);
      });
    }
  }, [activeTranscriptions]);

  const shouldScaleFontDown = useMemo(() => {
    return !isFullscreen && panelState == 'visible'
  }, [isFullscreen, panelState])
  
  // Fetch styles from database
  const {
    data: stylesMap,
    isLoading,
    error,
    refetch
  } = useQuery({
    ...subtitleQueries.styles({
      transcriptionsToFetch,
      setLoadingDuration,
    }),
    staleTime: 1000 * 60 * 60,
    enabled: transcriptionsToFetch.length > 0,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (stylesMap) {
      Object.entries(stylesMap).forEach(([transcription, styles]) => {
        if (styles.default) {
          handleSubtitleStylesInStore(
            transcription as StyleTranscription,
            styles.default,
            'default'
          );
        }
        
        if (styles.active) {
          handleSubtitleStylesInStore(
            transcription as StyleTranscription,
            styles.active,
            'active'
          );
        }
      });

      transcriptionsToFetch.forEach(transcription => {
        checkedTranscriptions.current.add(transcription);
      });
    }
  }, [stylesMap, transcriptionsToFetch, handleSubtitleStylesInStore]);

  const styles = useMemo(() => {
    const result = {} as TranscriptionStyles;
    
    // Helper function to get styles - first from query data, then from defaults
    const getStylesForTranscription = (transcription: StyleTranscription, state: 'default' | 'active') => {
      return (stylesMap?.[transcription]?.[state] || defaultSubtitleStyles[transcription][state]);
    };

    const defaultAllStyles = getStylesForTranscription('all', 'default');
    const activeAllStyles = getStylesForTranscription('all', 'active');

    if (!activeTranscriptions || activeTranscriptions.length === 0) {
      return { 
        all: {
          tokenStyles: getTokenStyles({
            shouldScaleFontDown, 
            styles: {
              active: activeAllStyles,
              default: defaultAllStyles
            },
            transcription: 'all'
          }),
          containerStyle: getContainerStyles({
            active: activeAllStyles,
            default: defaultAllStyles
          })
        } 
      };
    }
    
    result.all = {
      tokenStyles: getTokenStyles({
        shouldScaleFontDown,
        styles: {
          active: activeAllStyles,
          default: defaultAllStyles
        },
        transcription: 'all'
      }),
      containerStyle: getContainerStyles({
        active: activeAllStyles,
        default: defaultAllStyles
      })
    };

    ([...activeTranscriptions, "furigana"] as StyleTranscription[]).forEach(transcription => {
      const defaultStyleData = getStylesForTranscription(transcription, 'default');
      const activeStyleData = getStylesForTranscription(transcription, 'active');

      const hasCustomDefault = defaultStyleData && JSON.stringify(defaultStyleData) !== JSON.stringify(defaultSubtitleStyles[transcription].default);
      const hasCustomActive = activeStyleData && JSON.stringify(activeStyleData) !== JSON.stringify(defaultSubtitleStyles[transcription].active);
      
      if (hasCustomDefault || hasCustomActive) {
        result[transcription] = {
          tokenStyles: getTokenStyles({
            shouldScaleFontDown,
            styles: {
              active: activeStyleData,
              default: defaultStyleData
            },
            transcription
          }),
          containerStyle: getContainerStyles({
            active: activeStyleData,
            default: defaultStyleData
          })
        };
      }
    });
    
    return result;
  }, [stylesMap, activeTranscriptions, shouldScaleFontDown]);

  return {
    isLoading: isLoading,
    error: error,
    styles: styles as TranscriptionStyles,
    loadingDuration,
    refetch
  };
};