'use client'

import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/lib/stores/player-store";
import { Dispatch, SetStateAction, useMemo } from "react";
import { useMediaState } from "@vidstack/react";
import { cn } from "@/lib/utils/utils";
import { AnimeSkipTime } from "@/types/anime";

export default function SkipButton({ 
    canSkip,
    setCanSkip,
    skipTimes,
    currentTime
}: { 
    canSkip: boolean;
    setCanSkip: Dispatch<SetStateAction<boolean>>
    skipTimes: AnimeSkipTime[];
    currentTime: number
}) {
    const player = usePlayerStore((state) => state.player);
    const isFullscreen = useMediaState('fullscreen', player);
    const controlsVisible = useMediaState('controlsVisible', player);

    const buttonPositioning = useMemo(() => {
        if (isFullscreen) {
            return controlsVisible 
                ? { bottom: '7rem', right: '1rem' } 
                : { bottom: '3rem', right: '1rem' };
        }
        return controlsVisible 
            ? { bottom: '6rem', right: '1rem' } 
            : { bottom: '2rem', right: '1rem' };
    }, [isFullscreen, controlsVisible]);

    const getSkipType = () => {
        if(!currentTime || !skipTimes.length) return "";
        
        const matchedInterval = skipTimes.find(({ interval }) => 
            currentTime >= interval.startTime &&
            currentTime < interval.endTime
        );
        
        return matchedInterval?.skipType === 'OP' ? " Opening" : " Outro";
    };

    return (
        <>
            {canSkip && (
                <div 
                    style={{ position: 'absolute', ...buttonPositioning, zIndex: 10 }}
                >
                    <Button
                        className={cn(
                            "relative overflow-hidden",
                        )}
                        onClick={(() => {
                            if(!currentTime) return;
                            const skipInterval = skipTimes.find(
                                ({ interval }) =>
                                currentTime >= interval.startTime && currentTime < interval.endTime,
                            );
                            if (skipInterval) {
                                player.current?.remoteControl.seek(skipInterval.interval.endTime);
                                setCanSkip(false);
                            }
                        })}
                    >
                        <div>
                            <span className="font-medium">Skip</span>
                            {skipTimes.length > 0 && (
                                <span className="font-medium">{getSkipType()}</span>
                            )}
                        </div>
                    </Button>
                </div>
            )}
        </>
    );
}