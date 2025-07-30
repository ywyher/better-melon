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
  const [autoScroll, setAutoScroll] = useState<boolean>(playerSettings.autoScrollToCue); // Use setting
  
  const activeCueIdRef = useRef<number>(-1);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  const player = usePlayerStore((state) => state.player);
  const delay = useDelayStore((state) => state.delay);

  useEffect(() => {
    setAutoScroll(playerSettings.autoScrollToCue);
  }, [playerSettings.autoScrollToCue]);

  useEffect(() => {
    rowVirtualizer.measure()
  }, [selectedTranscription])

  // Dynamic size estimation based on transcription type
  const estimateSize = useMemo(() => {
    return (index: number) => {
      const cue = cues?.[index];
      if (!cue) return 60;
      
      if (selectedTranscription === 'japanese') {
        return 110;
      }
      
      const contentLength = cue.content?.length || 0;
      if (contentLength > 50) {
        return 80;
      }
      
      return 60;
    };
  }, [cues, selectedTranscription]);

  const rowVirtualizer = useVirtualizer({
      count: cues?.length || 0,
      getScrollElement: () => scrollAreaRef.current,
      estimateSize: estimateSize,
      overscan: 5,
      measureElement: (element: Element) => {
        return element.getBoundingClientRect().height || 60;
      },
  });

  const findActiveCue = useCallback((currentTime: number) => {
      if (!cues?.length || !playerSettings.autoScrollToCue) return;
      
      const activeCueIndex = cues.findIndex(cue => 
        currentTime >= (cue.from + delay.japanese) && currentTime <= (cue.to + delay.japanese)
      );
      
      if (activeCueIndex !== -1) {
          const activeCue = cues[activeCueIndex];
          
          if (activeCue.id !== activeCueIdRef.current) {
              activeCueIdRef.current = activeCue.id;
              
              if (activeCueIndex !== activeIndex) {
                  setActiveIndex(activeCueIndex);
                  
                if (autoScroll) {
                  rowVirtualizer.scrollToIndex(activeCueIndex, { 
                      align: 'center',
                      behavior: 'smooth'
                  });
                }
              }
          }
      } else if (activeCueIdRef.current !== -1) {
          activeCueIdRef.current = -1;
          setActiveIndex(-1);
      }

      return {
        activeCueIndex
      }
  }, [cues, delay.japanese, activeIndex, autoScroll, playerSettings.autoScrollToCue]);

  useEffect(() => {
    if(!player.current || !cues?.length) return;

    return player.current.subscribe(({ currentTime }) => {
        const now = Date.now();
        if (now - lastUpdateTimeRef.current > 250) {
          lastUpdateTimeRef.current = now;
          const activeCue = findActiveCue(currentTime);
          if(!activeCue) return;
          rowVirtualizer.scrollToIndex(activeCue?.activeCueIndex || 0, { 
            align: 'center',
            behavior: 'smooth'
          });
        }
    });
  }, [player, cues, findActiveCue]);
  
  useEffect(() => {
    if (!player.current || !cues?.length) return;
    console.log(`this one`)
    
    const timeoutId = setTimeout(() => {
      const currentTime = player.current?.currentTime || 0;
      findActiveCue(currentTime);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [selectedTranscription, cues]);

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