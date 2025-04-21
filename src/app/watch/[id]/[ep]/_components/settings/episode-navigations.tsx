'use client'

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SkipBack, SkipForward } from "lucide-react"

export default function EpisodeNavigations({ direction, episodesLength }: { direction: 'next' | 'previous', episodesLength: number }) {
    const router = useRouter();
    const params = useParams<{ id: string; ep: string }>();

    const isNext = direction === 'next';

    const handleClick = () => {
        const currentEp = parseInt(params.ep, 10);
        if (isNaN(currentEp)) return;

        const newEp = isNext ? currentEp + 1 : currentEp - 1;
        if (newEp < 1) return;

        router.push(`/watch/${params.id}/${newEp}`);
    };

    const isDisabled 
        =  (!isNext && parseInt(params.ep) == 1)
        || (isNext && parseInt(params.ep) == episodesLength);

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