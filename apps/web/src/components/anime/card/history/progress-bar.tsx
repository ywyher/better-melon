import React from 'react';
import { Progress } from "@/components/ui/progress"
import { Badge } from '@/components/ui/badge';

interface AnimeCardProgressBarProps {
  percentage: number;
  episodeNumber: number;
}

export default function AnimeHistoryCardProgressBar({ 
  percentage, 
  episodeNumber 
}: AnimeCardProgressBarProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-2 z-10">
      <div className="flex flex-col gap-2">
        <Badge className='text-sm bg-white/80'>E{episodeNumber}</Badge>
        <Progress value={percentage} />
      </div>
    </div>
  );
}