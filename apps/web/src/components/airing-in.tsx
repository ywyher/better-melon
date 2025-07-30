import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { AnilistNextAiringEpisode } from '@better-melon/shared/types';

type AiringInProps = {
  nextAiringEpisode: AnilistNextAiringEpisode;
};

export default function AiringIn({ nextAiringEpisode }: AiringInProps) {
  const [timeRemaining, setTimeRemaining] = useState(nextAiringEpisode.timeUntilAiring);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimeRemaining = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = () => {
    if (!nextAiringEpisode.airingAt) {
      return "Invalid date";
    }

    const date = nextAiringEpisode.airingAt * 1000

    return format(date, "M/d/yyyy, h:mm:ss a");
  };

  return (
    <Card className="w-full py-3 border border-dashed border-amber-500 rounded-md bg-amber-50 dark:bg-amber-950/20">
      <CardContent className='flex flex-col gap-2'>
        <div className='flex flex-row gap-1 items-center text-amber-700 dark:text-amber-400'>
          <h3 className="text-xl font-bold">
            Episode {nextAiringEpisode.episode}
          </h3>
          <span className="">
            (Unreleased)
          </span>
        </div>

        <div className="flex flex-row items-center gap-2 text-md text-amber-600 dark:text-amber-300">
          <p className="font-medium">
            Airs in:
          </p>
          <p className="font-mono font-bold">
            {formatTimeRemaining(timeRemaining)}
          </p>
        </div>

        <div className="flex items-center text-sm text-amber-500">
          {formatDate()}
        </div>
      </CardContent>
    </Card>
  );
}