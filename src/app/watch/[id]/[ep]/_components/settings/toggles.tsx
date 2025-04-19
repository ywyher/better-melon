"use client"

import { getPlayerSettings } from "@/app/settings/player/actions";
import ToggleButton from "@/app/watch/[id]/[ep]/_components/settings/toggle-button";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayerSettings } from "@/lib/db/schema";

export default function Toggles({ settings }: { settings: PlayerSettings }) {
    const autoPlay = usePlayerStore((state) => state.autoPlay)
    const setAutoPlay = usePlayerStore((state) => state.setAutoPlay)
    const autoNext = usePlayerStore((state) => state.autoNext)
    const setAutoNext = usePlayerStore((state) => state.setAutoNext)
    const autoSkip = usePlayerStore((state) => state.autoSkip)
    const setAutoSkip = usePlayerStore((state) => state.setAutoSkip)

    useEffect(() => {
        if (settings) {
            setAutoPlay(settings.autoPlay);
            setAutoNext(settings.autoNext);
            setAutoSkip(settings.autoSkip);
        }
    }, [settings, setAutoPlay, setAutoNext, setAutoSkip]);
    
    return (
        <div className="flex flex-row gap-2">
            <ToggleButton
                name="Auto Play"
                checked={autoPlay}
                onClick={() => setAutoPlay(!autoPlay)}
                className="w-fit"
                tooltip={
                    <div className="text-center">
                        Auto play episode <br />
                        <span className="font-bold text-red-500">Note: player will be muted by default</span>
                    </div>
                }
            />
    
            <ToggleButton
                name="Auto Next"
                checked={autoNext}
                onClick={() => setAutoNext(!autoNext)}
                className="w-fit"
                tooltip="Automatically go to the next episode after finishing"
            />
    
            <ToggleButton
                name="Auto Skip"
                checked={autoSkip}
                onClick={() => setAutoSkip(!autoSkip)}
                className="w-fit"
                tooltip="Automatically skip intros and outros"
            />
        </div>
    );
}