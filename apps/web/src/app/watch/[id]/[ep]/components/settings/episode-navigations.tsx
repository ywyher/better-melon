'use client'

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SkipBack, SkipForward } from "lucide-react"
import { useEpisodeStore } from "@/lib/stores/episode-store"

type EpisodeNavigationsProps = { 
    direction: 'next' | 'previous',
}

export default function EpisodeNavigations({ 
    direction, 
}: EpisodeNavigationsProps) {
    const router = useRouter();
    const isNext = direction === 'next';

    const animeId = useEpisodeStore((state) => state.animeId)
    const episodesLength = useEpisodeStore((state) => state.episodesLength)
    const episodeNumber = useEpisodeStore((state) => state.episodeNumber)
    const nextAiringEpisode = useEpisodeStore((state) => state.episodeData?.details.nextAiringEpisode)

    const handleClick = () => {
        const currentEp = Number(episodeNumber);
        if (isNaN(currentEp)) return;

        const newEp = isNext ? currentEp + 1 : currentEp - 1;
        if (newEp < 1) return;

        router.push(`/watch/${animeId}/${newEp}`);
    };

    const isDisabled 
        =  (!isNext && Number(episodeNumber) == 1)
        || (
            (isNext && Number(episodeNumber) == episodesLength)
            || (isNext && Number(episodeNumber) + 1 >= Number(nextAiringEpisode))
        );

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