"use client"

import { usePlayerStore } from "@/lib/stores/player-store";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useDelayStore } from "@/lib/stores/delay-store";

interface DelaySliderProps {
  label: string;
  value: number;
  step: number;
  onChange: (value: number) => void;
}

function DelaySlider({ label, value, step, onChange }: DelaySliderProps) {
  const [progress, setProgress] = useState([value]);

  useEffect(() => {
    setProgress([value]);
  }, [value]);

  const handleValueChange = (newValue: number[]) => {
    setProgress(newValue);
  };

  const handleCommit = () => {
    onChange(progress[0]);
  };

  const handleKeyUp = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      onChange(progress[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full flex-1">
      <span className="text-xs font-medium">{label}</span>
      <div className="flex flex-row items-center gap-3">
        <div className="flex-1">
          <Slider
            value={progress}
            min={-30}
            max={30}
            step={step}
            onValueChange={handleValueChange}
            onPointerUp={handleCommit}
            onKeyUp={handleKeyUp}
          />
        </div>
        <div className="w-12 text-right">
          {progress[0]}s
        </div>
      </div>
    </div>
  );
}

export default function DelayController() {
  const delay = useDelayStore((state) => state.delay);
  const setDelay = useDelayStore((state) => state.setDelay);

  const resetDelays = () => {
    setDelay({
      japanese: 0,
      english: 0
    });
  };

  const handleJapaneseChange = (value: number) => {
    setDelay({
      ...delay,
      japanese: value
    });
  };

  const handleEnglishChange = (value: number) => {
    setDelay({
      ...delay,
      english: value
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
        <DelaySlider
          label="Japanese"
          value={delay.japanese}
          step={0.5}
          onChange={handleJapaneseChange}
        />
        
        <Separator orientation="vertical" />
        
        <DelaySlider
          label="English"
          value={delay.english}
          step={0.5}
          onChange={handleEnglishChange}
        />
      </div>
    </div>
  );
}