"use client"
import { Button } from "@/components/ui/button";
import { SkipBack, SkipForward } from "lucide-react";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import { useMediaState } from "@vidstack/react";
import { srtTimestampToSeconds } from "@/lib/funcs";
import { SubtitleCue } from "@/types/subtitle";
import { useEffect, useState } from "react";

interface CueNavigationProps {
  direction: 'next' | 'previous';
}

export default function CueNavigation({ direction }: CueNavigationProps) {
  const [currentCue, setCurrentCue] = useState<SubtitleCue | null>(null);
  const player = useWatchStore((state) => state.player);
  const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile);
  const delay = useWatchStore((state) => state.delay);
  const subtitleCues = useWatchStore((state) => state.subtitleCues);
  const currentTime = useMediaState('currentTime', player);
  const isNext = direction === 'next';

  useEffect(() => {
    if (!subtitleCues || !currentTime) {
      setCurrentCue(null);
      return;
    }
    
    const activeCue = subtitleCues.find(cue => {
      const startTime = srtTimestampToSeconds(cue.from) + delay.japanese;
      const endTime = srtTimestampToSeconds(cue.to) + delay.japanese;
      return (currentTime + .1) >= startTime && (currentTime + .1) <= endTime;
    });
    
    if (activeCue) {
      setCurrentCue(activeCue);
    }
  }, [currentTime, subtitleCues, delay.japanese]);

  const handleCueNavigation = () => {
    if (!player.current || !subtitleCues || subtitleCues.length === 0) return;

    let targetCueId: number | null = null;
    
    if (currentCue) {
      targetCueId = currentCue.id + (isNext ? 1 : -1);
    } else {
      // Find the closest cue to the current time
      let closestCue: SubtitleCue | null = null;
      let minDistance = Infinity;
      
      for (const cue of subtitleCues) {
        const cueStartTime = srtTimestampToSeconds(cue.from) + delay.japanese;
        const cueEndTime = srtTimestampToSeconds(cue.to) + delay.japanese;
        
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
        const targetCueTime = srtTimestampToSeconds(targetCue.from) + delay.japanese;
        player.current.currentTime = targetCueTime;
        setCurrentCue(targetCue);
      }
    }
  };

  const isDisabled = !activeSubtitleFile || !subtitleCues || subtitleCues.length === 0 || 
    (!isNext && (!currentCue || currentCue?.id <= 1)) || 
    (currentCue && isNext && currentCue.id >= subtitleCues.length);

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