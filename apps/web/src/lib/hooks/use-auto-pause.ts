import { useDelayStore } from "@/lib/stores/delay-store";
import { usePlaybackSettingsStore } from "@/lib/stores/playback-settings-store";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useWatchDataStore } from "@/lib/stores/watch-store";
import { SubtitleCue, SubtitleTranscription } from "@/types/subtitle";
import { useMediaState } from "@vidstack/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UseAutoPauseProps = {
  activeSubtitles: Record<SubtitleTranscription, SubtitleCue[]>
}

export default function useAutoPause({
  activeSubtitles
}: UseAutoPauseProps) {
  const [pauseAt, setPauseAt] = useState<number | null>(null);
  const player = usePlayerStore((state) => state.player);
  const delay = useDelayStore((state) => state.delay);
  const pauseOnCue = usePlaybackSettingsStore((state) => state.pauseOnCue);
  const currentTime = useMediaState('currentTime', player);
  const cuePauseDuration = useWatchDataStore((state) => state.settings.playerSettings.cuePauseDuration);

  // Track processed pause points to prevent re-pausing
  const processedPausePoints = useRef<Set<number>>(new Set());
  const unPauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const japaneseCue = useMemo(() => {
    const japaneseCues = activeSubtitles?.japanese;
    return japaneseCues && japaneseCues.length > 0 ? japaneseCues[0] : null;
  }, [activeSubtitles?.japanese]);

  useEffect(() => {
    if (!player.current || !pauseOnCue) {
      setPauseAt(null);
      return;
    }

    if (japaneseCue) {
      // - 0.3 so the japanese subtitle won't have disappeared by the time the player paused
      const newPauseAt = japaneseCue.to + delay.japanese - 0.3;
      setPauseAt(newPauseAt);
    } else {
      setPauseAt(null);
    }
  }, [japaneseCue, player, delay.japanese, pauseOnCue]);

  // Handle pausing logic
  useEffect(() => {
    if (!player.current || !pauseOnCue || pauseAt === null) {
      return;
    }

    const PAUSE_WINDOW = 0.15;
    const PAUSE_BUFFER = 0.05; // Small buffer to prevent re-pausing after auto-unpause
    
    // Check if we're in the pause window
    // DONT ADD DELAY TO CURRENTTIME
    const inPauseWindow = currentTime >= pauseAt && 
                         currentTime < pauseAt + PAUSE_WINDOW;
    
    // Check if we haven't already processed this pause point
    const pausePointKey = Math.round(pauseAt * 10) / 10; // Round to 1 decimal place for consistency
    const alreadyProcessed = processedPausePoints.current.has(pausePointKey);

    if (inPauseWindow && !alreadyProcessed && !player.current.paused) {
      // Mark this pause point as processed
      processedPausePoints.current.add(pausePointKey);
      
      // Clean up old pause points (keep only last 10 to prevent memory leaks)
      if (processedPausePoints.current.size > 10) {
        const sortedPoints = Array.from(processedPausePoints.current).sort((a, b) => b - a);
        processedPausePoints.current = new Set(sortedPoints.slice(0, 10));
      }
      
      player.current.pause();
      
      // Handle auto-unpause
      if (cuePauseDuration !== null && cuePauseDuration > 0) {
        // Clear any existing timeout
        if (unPauseTimeoutRef.current) {
          clearTimeout(unPauseTimeoutRef.current);
        }
        
        unPauseTimeoutRef.current = setTimeout(() => {
          if (player.current && player.current.paused) {
            player.current.play();
          }
          unPauseTimeoutRef.current = null;
        }, cuePauseDuration * 1000);
      }
    }
    
    // Clean up processed pause points when we're far from the pause point
    if (currentTime > pauseAt + PAUSE_WINDOW + PAUSE_BUFFER) {
      processedPausePoints.current.delete(pausePointKey);
    }
  }, [pauseAt, currentTime, delay.japanese, pauseOnCue, player, cuePauseDuration]);

  useEffect(() => {
    return () => {
      if (unPauseTimeoutRef.current) {
        clearTimeout(unPauseTimeoutRef.current);
      }
      processedPausePoints.current.clear();
    };
  }, []); // Empty dependency array - this should only run on mount/unmount
}