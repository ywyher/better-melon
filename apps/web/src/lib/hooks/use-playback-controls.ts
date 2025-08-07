import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useThrottledCallback } from 'use-debounce';
import { AnimeSkipTime } from '@/types/anime';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useStreamingStore } from '@/lib/stores/streaming-store';
import { useSettingsStore } from '@/lib/stores/settings-store';

export default function usePlaybackControls({
  checkSkipAvailability
}: {
  checkSkipAvailability: ({ currentTime, autoSkip }: { currentTime: number, autoSkip: boolean }) => AnimeSkipTime | null
}) {
  const player = usePlayerStore((state) => state.player) 
  const streamingData = useStreamingStore((state) => state.streamingData) 
  const autoNext = useSettingsStore((state) => state.player.autoNext)
  const autoSkip = useSettingsStore((state) => state.player.autoSkip)
  const episodeNumber = useStreamingStore((state) => state.episodeNumber) 
  const animeId = useStreamingStore((state) => state.animeId) 

  const router = useRouter();
  const isTransitioning = useRef(false);

  const handlePlaybackEnded = useCallback(() => {
    if (!streamingData?.anime) return;

    if (!autoNext) {
      isTransitioning.current = false;
      return;
    }

    try {
      player.current?.pause();
      
      if (episodeNumber < streamingData.anime.episodes) {
        router.push(`/watch/${animeId}/${episodeNumber + 1}`);
      } else {
        toast.error("No more episodes to watch :(");
        isTransitioning.current = false;
      }
    } catch (error) {
      console.error('Error moving to the next episode:', error);
      isTransitioning.current = false;
    }
  }, [autoNext, episodeNumber, streamingData?.anime?.episodes, animeId, router]);

  const onTimeUpdate = useThrottledCallback(() => {
    if (!player.current) return;
    
    const currentTime = player.current.currentTime;
    const duration = player.current.duration;
    
    // Handle skip times
    const skipInterval = checkSkipAvailability({ currentTime, autoSkip });
    if (skipInterval && autoSkip) {
      player.current.currentTime = skipInterval.interval.endTime;
    }
    
    // Handle episode ending
    if ((duration - currentTime) < 3 && duration > 0 && !isTransitioning.current) {
      isTransitioning.current = true;
      handlePlaybackEnded();
    }
  }, 500, { trailing: true, leading: true });

  return {
    onTimeUpdate,
    handlePlaybackEnded,
    isTransitioning
  };
};