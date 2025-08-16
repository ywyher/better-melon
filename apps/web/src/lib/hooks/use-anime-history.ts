import { useEffect, useState, useRef } from 'react';
import { useQuery,  } from '@tanstack/react-query';
import { animeQueries } from '@/lib/queries/anime';
import { usePlayerStore } from '@/lib/stores/player-store';

type UseHistoryAnimeProps= {
  animeId: string | number;
  animeEpisode: number;
}

export function useAnimeHistory({ animeId, animeEpisode }: UseHistoryAnimeProps) {
  const player = usePlayerStore((state) => state.player)
  const isVideoReady = usePlayerStore((state) => state.isVideoReady)
  const loadingStartTime = useRef<number>(0);
  const [loadingDuration, setLoadingDuration] = useState<number>(0);
  
  const {
    data: animeHistory,
    isLoading,
    error,
    refetch
  } = useQuery({
    ...animeQueries.historyByAnime({ animeId: String(animeId), animeEpisode }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if(isVideoReady && animeHistory && player.current) {
      player.current.remoteControl.seek(animeHistory.progress);
    }
  }, [isVideoReady, animeHistory, player]);

  useEffect(() => {
    if (isLoading) {
      loadingStartTime.current = Date.now();
    } else if (animeHistory && loadingStartTime.current > 0 && loadingDuration === 0) {
      const duration = Date.now() - loadingStartTime.current;
      setLoadingDuration(duration);
    }
  }, [isLoading, animeHistory, loadingDuration]);

  return {
    animeHistory,
    isLoading,
    error,
    loadingDuration,
    refetch
  };
}