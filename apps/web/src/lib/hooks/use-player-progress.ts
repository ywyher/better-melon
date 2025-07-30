import { usePlayerStore } from "@/lib/stores/player-store";
import { useEffect, useRef, useState } from "react";

export function usePlayerProgress() {
  const player = usePlayerStore((state) => state.player)
  const [currentTime, setCurrentTime] = useState(false);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (!player?.current) return;

    const unsubscribe = player.current.subscribe(({ currentTime, duration }) => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 250) {
        lastUpdateRef.current = now;
        setPassedHalfDuration(Number(currentTime) >= Number(duration / 2));
      }
    });

    return unsubscribe;
  }, [player?.current]);

  return passedHalfDuration;
}