"use client";

import { Button } from "@/components/ui/button";
import { SkipBack, SkipForward } from "lucide-react";
import { usePlayerStore } from "@/lib/stores/player-store";
import { SubtitleCue, SubtitleFormat } from "@/types/subtitle";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { getExtension } from "@/lib/utils/utils";
import { useDelayStore } from "@/lib/stores/delay-store";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";

interface CueNavigationProps {
  direction: 'next' | 'previous';
}

export default function CueNavigations({ direction }: CueNavigationProps) {
  const player = usePlayerStore((state) => state.player);
  const delay = useDelayStore((state) => state.delay);;
  const subtitleCues = useSubtitleStore((state) => state.subtitleCues);
  const activeSubtitleFile = useSubtitleStore((state) => state.activeSubtitleFile);
  
  const isNext = direction === 'next';
  const currentTimeRef = useRef<number>(0);
  
  // Listen to player time updates safely
  useEffect(() => {
    if (!player.current) return;
    
    try {
      const updateCurrentTime = ({ currentTime }: { currentTime: number }) => {
        currentTimeRef.current = currentTime;
      };
      
      return player.current.subscribe(updateCurrentTime);
    } catch (e) {
      console.warn("Error subscribing to player:", e);
      return undefined;
    }
  }, [player]);

  // Find the current active cue without triggering state updates
  const findCurrentCue = useCallback(() => {
    if (!subtitleCues || !subtitleCues.length || !activeSubtitleFile) return null;
    
    // Use the reference value to avoid the this.$state is null error
    const currentTime = currentTimeRef.current;
    
    return subtitleCues.find(cue => {
      const startTime = cue.from + delay.japanese
      
      const endTime = cue.to + delay.japanese
      
      return currentTime >= startTime && currentTime <= endTime;
    }) || null;
  }, [subtitleCues, activeSubtitleFile, delay.japanese]);

  const handleCueNavigation = useCallback(() => {
    if (!player.current || !subtitleCues || subtitleCues.length === 0 || !activeSubtitleFile) return;

    // Always use the ref for current time
    const currentTime = currentTimeRef.current;
    const currentCue = findCurrentCue();
    
    // Find target cue based on direction
    let targetCue: SubtitleCue | undefined = undefined;
    
    if (currentCue) {
      // Get the index instead of using ID which might have gaps
      const currentIndex = subtitleCues.findIndex(cue => cue.id === currentCue.id);
      const targetIndex = currentIndex + (isNext ? 1 : -1);
      
      if (targetIndex >= 0 && targetIndex < subtitleCues.length) {
        targetCue = subtitleCues[targetIndex];
      }
    } else {
      // No current cue, find closest in direction
      if (isNext) {
        // Find first cue after current time
        targetCue = subtitleCues.find(cue => {
          const startTime = cue.from + delay.japanese
          return startTime > currentTime;
        });
        
        // If no cue found ahead, go to first cue
        if (!targetCue) targetCue = subtitleCues[0];
      } else {
        // Find last cue before current time
        for (let i = subtitleCues.length - 1; i >= 0; i--) {
          const startTime = subtitleCues[i].from + delay.japanese
          if (startTime < currentTime) {
            targetCue = subtitleCues[i];
            break;
          }
        }
        // If no cue found before, go to last cue
        if (!targetCue) targetCue = subtitleCues[subtitleCues.length - 1];
      }
    }
    
    // Navigate to target cue with error handling
    if (targetCue && player.current) {
      const targetTime = targetCue.from + delay.japanese
      
      try {
        player.current.currentTime = targetTime;
        
        // Try to play if paused, for better UX when navigating
        // Maybe its bad for the ux ?
        // if (player.current.paused) {
        //   player.current.play().catch(() => {
        //     console.warn("Failed to play after cue navigation");
        //   });
        // }
      } catch (e) {
        console.warn("Error navigating to cue:", e);
      }
    }
  }, [subtitleCues, isNext, delay.japanese, player, activeSubtitleFile, findCurrentCue]);
  
  // Determine if button should be disabled
  const isDisabled = useMemo(() => {
    if (!activeSubtitleFile || !subtitleCues || subtitleCues.length === 0) {
      return true;
    }
    
    const currentCue = findCurrentCue();
    
    if (!currentCue) {
      return false; // Always enable if no current cue
    }
    
    // For "previous" button: disable if at first cue
    if (!isNext && currentCue.id === Math.min(...subtitleCues.map(c => c.id))) {
      return true;
    }
    
    // For "next" button: disable if at last cue
    if (isNext && currentCue.id === Math.max(...subtitleCues.map(c => c.id))) {
      return true;
    }
    
    return false;
  }, [activeSubtitleFile, subtitleCues, isNext, findCurrentCue]);

  return (
    <Button
      variant="outline"
      onClick={handleCueNavigation}
      disabled={isDisabled}
      className="w-full flex-1"
    >
      {!isNext && <SkipBack className="mr-2" size={16} />}
      {isNext ? 'Next Cue' : 'Previous Cue'}
      {isNext && <SkipForward className="ml-2" size={16} />}
    </Button>
  );
}