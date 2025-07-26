'use client'

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SkipBack, SkipForward } from "lucide-react"
import { Anime } from "@/types/anime"

type EpisodeNavigationsProps = { 
    direction: 'next' | 'previous',
    episodesLength: number
    nextAiringEpisode?: number
    episodeNumber: number
    animeId: Anime['id']
}

export default function EpisodeNavigations({ 
    direction, 
    episodesLength,
    nextAiringEpisode,
    animeId,
    episodeNumber
}: EpisodeNavigationsProps) {
    const router = useRouter();

    const isNext = direction === 'next';

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