"use client"

import { Button } from "@/components/ui/button";
import { SkipForward } from "lucide-react";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import { useMediaState } from "@vidstack/react";
import { srtTimestampToSeconds } from "@/lib/funcs";

export default function NextCue() {
    const player = useWatchStore((state) => state.player);
    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile);
    const delay = useWatchStore((state) => state.delay);
    const currentTime = useMediaState('currentTime', player);
    
    const handleNextCue = () => {
        if (!player.current) return;
        const subtitleCues = useWatchStore.getState().subtitleCues;
        if (!subtitleCues || !currentTime) return;
        
        const currentCue = subtitleCues.find(cue => {
            const startTime = srtTimestampToSeconds(cue.from);
            const endTime = srtTimestampToSeconds(cue.to);
            return currentTime >= startTime + delay.japanese && currentTime <= endTime + delay.japanese;
        });
        
        if(!currentCue) return;
        
        const nextCue = subtitleCues.find(cue => cue.id == (currentCue?.id + 1));

        console.log(`currentCue`)
        console.log(currentCue)

        console.log(`nextCue`)
        console.log(nextCue)

        if (nextCue) {
            const nextCueTime = srtTimestampToSeconds(nextCue.from) + delay.japanese;
            player.current.currentTime = Math.max(0, nextCueTime);
        }
    };

    return (
        <Button 
            variant='outline' 
            onClick={handleNextCue} 
            disabled={!activeSubtitleFile}
            className="flex-1"
        >
            <SkipForward className="mr-2" size={16} />
            Next Cue
        </Button>
    );
}