'use client'

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SkipBack, SkipForward } from "lucide-react"
import { useMemo } from "react"
import { useStreamingStore } from "@/lib/stores/streaming-store"

type EpisodeNavigationsProps = { 
    direction: 'next' | 'previous',
}

export default function EpisodeNavigations({ 
    direction, 
}: EpisodeNavigationsProps) {
    const router = useRouter();
    const isNext = direction === 'next';

    const animeId = useStreamingStore((state) => state.animeId)
    const episodeNumber = useStreamingStore((state) => state.episodeNumber)
    const streamingData = useStreamingStore((state) => state.streamingData)

    const handleClick = () => {
        const currentEp = Number(episodeNumber);
        if (isNaN(currentEp)) return;

        const newEp = isNext ? currentEp + 1 : currentEp - 1;
        if (newEp < 1) return;

        router.push(`/watch/${animeId}/${newEp}`);
    };

    const isDisabled = useMemo(() => {
        const nextAiringEpisode = streamingData?.anime.nextAiringEpisode
        const episodesLength = streamingData?.anime.episodes
        const episodeNum = Number(episodeNumber);
        const nextAiringNum = Number(nextAiringEpisode);

        if (!isNext && episodeNum === 1) return true;

        if (isNext) {
            if(episodeNum === episodesLength) return true;
            if(nextAiringNum && episodeNum + 1 >= nextAiringNum) return true
        }

        return false;
    }, [isNext, episodeNumber, streamingData?.anime]);


    return (
        <Button 
            variant="outline" 
            onClick={handleClick}
            className="w-full flex-1"
            disabled={isDisabled}
        >
            {!isNext && <SkipBack className="mr-2" size={16} />}
            {isNext ? 'Next Episode' : 'Previous Epsiode'}
            {isNext && <SkipForward className="ml-2" size={16} />}
        </Button>
    );
}