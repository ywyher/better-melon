import { useDelayStore } from '@/lib/stores/delay-store';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useWatchDataStore } from '@/lib/stores/watch-store';
import { SubtitleCue, SubtitleTranscription } from '@/types/subtitle';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type UseSubtitleCuesListProps = { 
    cues: SubtitleCue[];
    selectedTranscription: SubtitleTranscription
}

export function useSubtitleCuesList({ cues, selectedTranscription }: UseSubtitleCuesListProps) {
  const playerSettings = useWatchDataStore((state) => state.settings.playerSettings)

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [autoScroll, setAutoScroll] = useState<boolean>(playerSettings.autoScrollToCue);
  
  const activeCueIdRef = useRef<number>(-1);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  const player = usePlayerStore((state) => state.player);
  const delay = useDelayStore((state) => state.delay);

  // Dynamic size estimation based on transcription type
  const estimateSize = useMemo(() => {
    return (index: number) => {
      const cue = cues?.[index];
      if (!cue) return 80;
      
      if (selectedTranscription === 'japanese') {
        return 110;
      }
      
      const contentLength = cue.content?.length || 0;
      if (contentLength > 50) {
        return 80;
      }
      
      return 80;
    };
  }, [cues, selectedTranscription]);

  const rowVirtualizer = useVirtualizer({
      count: cues?.length || 0,
      getScrollElement: () => scrollAreaRef.current,
      estimateSize: estimateSize,
      overscan: 0,
      measureElement: (element: Element) => {
        return element.getBoundingClientRect().height || 60;
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
    rowVirtualizer.measure()
    
    const timeoutId = setTimeout(() => {
      const currentTime = player.current?.currentTime || 0;
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
  }, [selectedTranscription, findActiveCue, rowVirtualizer]);

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