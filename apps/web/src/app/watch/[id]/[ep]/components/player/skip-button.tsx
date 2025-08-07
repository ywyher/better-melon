'use client'

import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/lib/stores/player-store";
import { Dispatch, SetStateAction, useMemo, useCallback } from "react";
import { useMediaState } from "@vidstack/react";
import { cn } from "@/lib/utils/utils";
import { AnimeSkipTime } from "@/types/anime";

interface SkipButtonProps {
    canSkip: boolean;
    setCanSkip: Dispatch<SetStateAction<boolean>>;
    skipTimes: AnimeSkipTime[];
}

export default function SkipButton({ 
    canSkip,
    setCanSkip,
    skipTimes,
}: SkipButtonProps) {
    const player = usePlayerStore((state) => state.player);
    const isFullscreen = useMediaState('fullscreen', player);
    const controlsVisible = useMediaState('controlsVisible', player);
    const currentTime = useMediaState('currentTime', player)

    const buttonStyle = useMemo(() => ({
        position: 'absolute' as const,
        bottom: isFullscreen 
            ? (controlsVisible ? '7rem' : '3rem')
            : (controlsVisible ? '6rem' : '2rem'),
        right: '1rem',
        zIndex: 10
    }), [isFullscreen, controlsVisible]);

    const currentSkipInterval = useMemo(() => {
        if (!currentTime || !skipTimes.length) return null;
        
        return skipTimes.find(({ interval }) => 
            currentTime >= interval.startTime && currentTime < interval.endTime
        ) || null;
    }, [currentTime, skipTimes]);

    const skipTypeText = useMemo(() => {
        if (!currentSkipInterval) return "";
        return currentSkipInterval.skipType === 'OP' ? " Opening" : " Outro";
    }, [currentSkipInterval]);

    const handleSkip = useCallback(() => {
        if (!currentSkipInterval || !player.current) return;
        
        player.current.remoteControl.seek(currentSkipInterval.interval.endTime);
        setCanSkip(false);
    }, [currentSkipInterval, player, setCanSkip]);

    if (!canSkip) return null;

    return (
        <div style={buttonStyle}>
            <Button
                className={cn("relative overflow-hidden")}
                onClick={handleSkip}
            >
                <span className="font-medium">
                    Skip{skipTypeText}
                </span>
            </Button>
        </div>
    );
}