import { useEffect, useState, useRef } from 'react';
import { useQuery,  } from '@tanstack/react-query';
import { animeQueries } from '@/lib/queries/anime';
import { usePlayerStore } from '@/lib/stores/player-store';

type UseHistoryMediaProps= {
  mediaId: string | number;
  mediaEpisode: number;
}

export function useMediaHistory({ mediaId, mediaEpisode }: UseHistoryMediaProps) {
  const player = usePlayerStore((state) => state.player)
  const isVideoReady = usePlayerStore((state) => state.isVideoReady)
  const loadingStartTime = useRef<number>(0);
  const [loadingDuration, setLoadingDuration] = useState<number>(0);
  
  const {
    data: mediaHistory,
    isLoading,
    error,
    refetch
  } = useQuery({
    ...animeQueries.historyByMedia({ mediaId: String(mediaId), mediaEpisode }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if(isVideoReady && mediaHistory && player.current) {
      player.current.remoteControl.seek(mediaHistory.progress);
    }
  }, [isVideoReady, mediaHistory, player.current]);

  useEffect(() => {
    if (isLoading) {
      loadingStartTime.current = Date.now();
    } else if (mediaHistory && loadingStartTime.current > 0 && loadingDuration === 0) {
      const duration = Date.now() - loadingStartTime.current;
      setLoadingDuration(duration);
    }
  }, [isLoading, mediaHistory, loadingDuration]);

  return {
    mediaHistory,
    isLoading,
    error,
    loadingDuration,
    refetch
  };
}