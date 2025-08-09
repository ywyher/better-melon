import { useDelayStore } from '@/lib/stores/delay-store';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { SubtitleCue, SubtitleTranscription } from '@/types/subtitle';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type UseSubtitleCuesListProps = { 
    cues: SubtitleCue[];
    selectedTranscription: SubtitleTranscription
}

export function useSubtitleCuesList({ cues, selectedTranscription }: UseSubtitleCuesListProps) {
  const playerSettings = useSettingsStore((settings) => settings.player)

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [autoScroll, setAutoScroll] = useState<boolean>(playerSettings.autoScrollToCue);
  
  const activeCueIdRef = useRef<number>(-1);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  const player = usePlayerStore((state) => state.player);
  const delay = useDelayStore((state) => state.delay);

  // More sophisticated dynamic size estimation
  const estimateSize = useMemo(() => {
    return (index: number) => {
      const cue = cues?.[index];
      if (!cue || !cue.content) return 60; // Base minimum height
      
      const content = cue.content.trim();
      const contentLength = content.length;
      
      // Base height for padding, margins, etc.
      const baseHeight = 45;
      
      // Estimate based on character count and line breaks
      const estimatedLines = Math.max(1, Math.ceil(contentLength / 50)); // ~50 chars per line
      const actualLineBreaks = (content.match(/\n/g) || []).length;
      const totalLines = Math.max(estimatedLines, actualLineBreaks + 1);
      
      // Line height varies by transcription type
      const lineHeight = selectedTranscription === 'japanese' ? 28 : 24;
      
      // Calculate total height
      const estimatedHeight = baseHeight + (totalLines * lineHeight);
      
      // Set reasonable bounds
      return Math.max(60, Math.min(estimatedHeight, 300));
    };
  }, [cues, selectedTranscription]);

  const rowVirtualizer = useVirtualizer({
      count: cues?.length || 0,
      getScrollElement: () => scrollAreaRef.current,
      estimateSize: estimateSize,
      overscan: 3,
      measureElement: (element: Element) => {
        const height = element.getBoundingClientRect().height;
        return height > 0 ? height : 60;
      },
  });

  const findActiveCue = useCallback((currentTime: number) => {
      if (!cues?.length) return null;
      
      const activeCueIndex = cues.findIndex(cue => 
        currentTime >= (cue.from + delay.japanese) && currentTime <= (cue.to + delay.japanese)
      );
      
      if (activeCueIndex !== -1) {
          return {
            cue: cues[activeCueIndex],
            index: activeCueIndex
          };
      }
      
      return null;
  }, [cues, delay.japanese]);

  const handleAutoScroll = useCallback((activeCueIndex: number) => {
    if (!autoScroll || !playerSettings.autoScrollToCue) return;
    
    rowVirtualizer.scrollToIndex(activeCueIndex, { 
        align: 'center',
        behavior: 'smooth'
    });
  }, [autoScroll, playerSettings.autoScrollToCue, rowVirtualizer]);

  const updateActiveCue = useCallback((currentTime: number) => {
      if (!playerSettings.autoScrollToCue) return;
      
      const activeCueData = findActiveCue(currentTime);
      
      if (activeCueData) {
          const { cue, index } = activeCueData;
          
          if (cue.id !== activeCueIdRef.current) {
              activeCueIdRef.current = cue.id;
              
              if (index !== activeIndex) {
                setActiveIndex(index);
                handleAutoScroll(index);
              }
          }
      } else if (activeCueIdRef.current !== -1) {
          activeCueIdRef.current = -1;
          setActiveIndex(-1);
      }
  }, [findActiveCue, activeIndex, handleAutoScroll, playerSettings.autoScrollToCue]);

  useEffect(() => {
    if(!player.current || !cues?.length) return;

    return player.current.subscribe(({ currentTime }) => {
        const now = Date.now();
        if (now - lastUpdateTimeRef.current > 250) {
          lastUpdateTimeRef.current = now;
          updateActiveCue(currentTime);
        }
    });
  }, [player, cues, updateActiveCue]);
  
  useEffect(() => {
    if (!player.current || !cues?.length) return;
    
    // Force remeasure all items when transcription changes
    rowVirtualizer.measure();
    
    const timeoutId = setTimeout(() => {
      if(!player.current) return;
      const currentTime = player?.current?.currentTime || 0;
      const activeCueData = findActiveCue(currentTime);
      
      if (activeCueData) {
        // Update state immediately
        activeCueIdRef.current = activeCueData.cue.id;
        setActiveIndex(activeCueData.index);
        
        // Force scroll on transcription change regardless of autoScroll state
        rowVirtualizer.scrollToIndex(activeCueData.index, { 
          align: 'center',
          behavior: 'smooth'
        });
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [selectedTranscription, findActiveCue, rowVirtualizer, player, cues]);

  // Force remeasure when cues change (content might have changed)
  useEffect(() => {
    if (cues?.length) {
      rowVirtualizer.measure();
    }
  }, [cues, rowVirtualizer]);

  const handleManualScroll = useCallback(() => {
    if (!playerSettings.autoScrollToCue) return
    
    setAutoScroll(false);
    
    if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
    }
    
    // Use the setting value or fallback to 5000ms
    const delayMs = (playerSettings.autoScrollResumeDelay || 5) * 1000;
    
    autoScrollTimerRef.current = setTimeout(() => {
        setAutoScroll(true);
    }, delayMs);
  }, [playerSettings.autoScrollToCue, playerSettings.autoScrollResumeDelay]);

  useEffect(() => {
    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
      }
    };
  }, []);

  return {
    scrollAreaRef,
    rowVirtualizer,
    activeCueIdRef,
    handleManualScroll,
  };
}