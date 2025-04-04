"use client"

import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function DelaySlider() {
    const delay = useWatchStore((state) => state.delay);
    const setDelay = useWatchStore((state) => state.setDelay);
    
    const [progress, setProgress] = useState([delay]);

    useEffect(() => {
        setProgress([delay]);
    }, [delay]);

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Subtitle Delay</span>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                        setDelay(0);
                        setProgress([0]);
                    }}
                >
                    Reset
                </Button>
            </div>
            <div className="flex flex-row items-center gap-3">
                <div className="flex-1">
                    <Slider
                        defaultValue={[delay]}
                        min={-30}
                        max={30}
                        step={1}
                        onValueChange={(e) => setProgress(e)}
                        onPointerUp={() => {
                            setDelay(progress[0])
                        }}
                    />
                </div>
                <div className="w-12 text-right">
                    {progress[0]}s
                </div>
            </div>
        </div>
    );
}