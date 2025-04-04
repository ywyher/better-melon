"use client"

import { Button } from "@/components/ui/button";
import { SkipForward } from "lucide-react";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import { useMediaState } from "@vidstack/react";
import { srtTimestampToSeconds } from "@/lib/funcs";

export default function PreviousCue() {
    const player = useWatchStore((state) => state.player);
    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile);
    const delay = useWatchStore((state) => state.delay);
    const currentTime = useMediaState('currentTime', player);
    
    const handlePreviousCue = () => {
        if (!player.current) return;
        const subtitleCues = useWatchStore.getState().subtitleCues;
        if (!subtitleCues || !currentTime) return;
        
        const currentCue = subtitleCues.find(cue => {
            const startTime = srtTimestampToSeconds(cue.from);
            const endTime = srtTimestampToSeconds(cue.to);
            return currentTime >= startTime + delay && currentTime <= endTime + delay;
        });
        
        if(!currentCue) return;
        
        const previousCue = subtitleCues.find(cue => cue.id == (currentCue?.id - 1));

        if (previousCue) {
            const previousCueTime = srtTimestampToSeconds(previousCue.from) + delay;
            player.current.currentTime = Math.max(0, previousCueTime);
        }
    };

    return (
        <Button 
            variant='outline' 
            onClick={handlePreviousCue} 
            disabled={!activeSubtitleFile}
            className="flex-1"
        >
            <SkipForward className="mr-2" size={16} />
            Previous Cue
        </Button>
    );
}