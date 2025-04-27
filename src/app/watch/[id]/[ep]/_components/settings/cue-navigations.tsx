"use client";

import { Button } from "@/components/ui/button";
import { SkipBack, SkipForward } from "lucide-react";
import { usePlayerStore } from "@/lib/stores/player-store";
import { SubtitleCue, SubtitleFormat } from "@/types/subtitle";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getExtension } from "@/lib/utils";
import { timestampToSeconds } from "@/lib/subtitle";

interface CueNavigationProps {
  direction: 'next' | 'previous';
}

export default function CueNavigations({ direction }: CueNavigationProps) {
  const [currentCue, setCurrentCue] = useState<SubtitleCue | null>(null);
  const player = usePlayerStore((state) => state.player);
  const delay = usePlayerStore((state) => state.delay);
  const subtitleCues = usePlayerStore((state) => state.subtitleCues);
  const activeSubtitleFile = usePlayerStore((state) => state.activeSubtitleFile);
  
  const isNext = direction === 'next';
  const currentTimeRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);

  const findActiveCue = useCallback((currentTime: number) => {
    if (!subtitleCues) {
      if (currentCue !== null) setCurrentCue(null);
      return;
    }

    const activeCue = subtitleCues.find(cue => {
      const startTime = timestampToSeconds({
        timestamp: (cue.from) + delay.japanese,
        format: getExtension(activeSubtitleFile?.file.name || "srt") as SubtitleFormat
      })
      const endTime = timestampToSeconds({
        timestamp: (cue.to) + delay.japanese,
        format: getExtension(activeSubtitleFile?.file.name || "srt") as SubtitleFormat
      })
      return (currentTime + .1) >= startTime && (currentTime + .1) <= endTime;
    });
    
    // Only update state if the cue has changed
    if (activeCue?.id !== currentCue?.id) {
      setCurrentCue(activeCue || null);
    }
  }, [subtitleCues, delay.japanese, currentCue, activeSubtitleFile]);

  // Subscribe to player updates without causing re-renders
  useEffect(() => {
    if (!player.current) return;

    return player.current.subscribe(({ currentTime }) => {
      currentTimeRef.current = currentTime;
      
      // Throttle state updates to avoid performance issues
      const now = Date.now();
      if (now - lastUpdateTimeRef.current > 250) {
        lastUpdateTimeRef.current = now;
        findActiveCue(currentTime);
      }
    });
  }, [player, findActiveCue]);

  const handleCueNavigation = useCallback(() => {
    if (!player.current || !subtitleCues || subtitleCues.length === 0) return;

    let targetCueId: number | null = null;
    const currentTime = currentTimeRef.current;
    
    if (currentCue) {
      targetCueId = currentCue.id + (isNext ? 1 : -1);
    } else {
      // Find the closest cue to the current time
      let closestCue: SubtitleCue | null = null;
      let minDistance = Infinity;
      
      for (const cue of subtitleCues) {
        const cueStartTime = timestampToSeconds({
          timestamp: (cue.from) + delay.japanese,
          format: getExtension(activeSubtitleFile?.file.name || "srt") as SubtitleFormat
        })
        const cueEndTime = timestampToSeconds({
          timestamp: (cue.to) + delay.japanese,
          format: getExtension(activeSubtitleFile?.file.name || "srt") as SubtitleFormat
        })
        
        // If we're looking for the next cue, find the closest one ahead of current time
        if (isNext && cueStartTime > currentTime) {
          const distance = cueStartTime - currentTime;
          if (distance < minDistance) {
            minDistance = distance;
            closestCue = cue;
          }
        } 
        // If we're looking for the previous cue, find the closest one before current time
        else if (!isNext && cueEndTime < currentTime) {
          const distance = currentTime - cueEndTime;
          if (distance < minDistance) {
            minDistance = distance;
            closestCue = cue;
          }
        }
      }
      
      // If no cue was found in the desired direction, take the first or last cue
      if (!closestCue) {
        closestCue = isNext ? subtitleCues[0] : subtitleCues[subtitleCues.length - 1];
      }
      
      if (closestCue) {
        targetCueId = closestCue.id;
      }
    }
    
    // Find and navigate to the target cue
    if (targetCueId !== null) {
      const targetCue = subtitleCues.find(cue => cue.id === targetCueId);
      if (targetCue && player.current) {
        const targetCueTime = timestampToSeconds({
          timestamp: (targetCue.from) + delay.japanese,
          format: getExtension(activeSubtitleFile?.file.name || "srt") as SubtitleFormat
        })
        
        player.current.currentTime = targetCueTime;
        setCurrentCue(targetCue);
      }
    }
  }, [subtitleCues, currentCue, isNext, delay.japanese, player, activeSubtitleFile]);
  
  const isDisabled = useMemo(() => {
    return !activeSubtitleFile || !subtitleCues || subtitleCues.length === 0 || 
      (!isNext && (currentCue && currentCue.id <= 1)) || 
      (currentCue && isNext && currentCue.id >= subtitleCues.length);
  }, [activeSubtitleFile, subtitleCues, currentCue, isNext]);

  return (
    <Button
      variant="outline"
      onClick={handleCueNavigation}
      disabled={isDisabled || false}
      className="w-full flex-1"
    >
      {!isNext && <SkipBack className="mr-2" size={16} />}
      {isNext ? 'Next Cue' : 'Previous Cue'}
      {isNext && <SkipForward className="ml-2" size={16} />}
    </Button>
  );
}