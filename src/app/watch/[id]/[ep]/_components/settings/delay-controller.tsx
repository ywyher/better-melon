"use client"

import { usePlayerStore } from "@/lib/stores/player-store";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";

export default function DelayController() {
  const delay = usePlayerStore((state) => state.delay);
  const setDelay = usePlayerStore((state) => state.setDelay);
  const [japaneseProgress, setJapaneseProgress] = useState([delay.japanese]);
  const [englishProgress, setEnglishProgress] = useState([delay.english]);

  useEffect(() => {
    setJapaneseProgress([delay.japanese]);
    setEnglishProgress([delay.english]);
  }, [delay.japanese, delay.english]);

  const resetDelays = () => {
    setDelay({
      japanese: 0,
      english: 0
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Subtitle Delay</span>
        <Button
          variant="outline"
          size="sm"
          onClick={resetDelays}
        >
          Reset Subtitle Delay
        </Button>
      </div>

      <div className="flex flex-row gap-3 justify-between items-center">
        {/* Japanese Subtitle Delay */}
        <div className="flex flex-col gap-2 w-full flex-1">
          <span className="text-xs font-medium">Japanese</span>
          <div className="flex flex-row items-center gap-3">
            <div className="flex-1">
              <Slider
                value={japaneseProgress}
                min={-30}
                max={30}
                step={0.5}
                onValueChange={(e) => setJapaneseProgress(e)}
                onPointerUp={() => {
                  setDelay({
                    ...delay,
                    japanese: japaneseProgress[0]
                  });
                }}
              />
            </div>
            <div className="w-12 text-right">
              {japaneseProgress[0]}s
            </div>
          </div>
        </div>
        <Separator orientation="vertical" />
        {/* English Subtitle Delay */}
        <div className="flex flex-col gap-2 w-full flex-1">
          <span className="text-xs font-medium">English</span>
          <div className="flex flex-row items-center gap-3">
            <div className="flex-1">
              <Slider
                value={englishProgress}
                min={-30}
                max={30}
                step={1}
                onValueChange={(e) => setEnglishProgress(e)}
                onPointerUp={() => {
                  setDelay({
                    ...delay,
                    english: englishProgress[0]
                  });
                }}
              />
            </div>
            <div className="w-12 text-right">
              {englishProgress[0]}s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}