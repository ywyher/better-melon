import { StyleTranscription } from "@/app/watch/[id]/[ep]/types";
import { subtitleQueries } from "@/lib/queries/subtitle";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { useQuery } from "@tanstack/react-query";
import { useMediaState } from "@vidstack/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useUIStateStore } from "@/lib/stores/ui-state-store";
import { useTranscriptionStore } from "@/lib/stores/transcription-store";

export const useSubtitleStyles = () => {
  const activeTranscriptions = useTranscriptionStore((state) => state.activeTranscriptions);
  const panelState = useUIStateStore((state) => state.panelState);
  const isFullscreen = useMediaState('fullscreen', usePlayerStore((state) => state.player));
  
  const rawStyles = useSubtitleStylesStore((state) => state.rawStyles);
  const computedStyles = useSubtitleStylesStore((state) => state.computedStyles);

  const handleStyles = useSubtitleStylesStore((state) => state.handleStyles);
  const updateScaling = useSubtitleStylesStore((state) => state.updateScaling);
  
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
    return !isFullscreen && panelState == 'visible';
  }, [isFullscreen, panelState]);
  
  useEffect(() => {
    updateScaling(shouldScaleFontDown);
  }, [shouldScaleFontDown, updateScaling]);
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    ...subtitleQueries.styles({
      setLoadingDuration,
      checkedTranscriptions,
      handleStyles,
      transcriptionsToFetch,
    }),
    staleTime: 1000 * 60 * 60,
    enabled: transcriptionsToFetch.length > 0,
    refetchOnWindowFocus: false
  });

  return {
    isLoading: isLoading,
    error: error,
    rawStyles: rawStyles,
    computedStyles: computedStyles,
    loadingDuration,
    refetch,
  };
};