import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Anime } from '@/types/anime';
import { streamingQueries } from '@/lib/queries/streaming';

export function useStreamingData(animeId: Anime['id'], episodeNumber: number) {
  const loadingStartTime = useRef<number>(0);
  const [loadingDuration, setLoadingDuration] = useState<number>(0);

  const {
    data: streamingData,
    isLoading,
    error,
    refetch
  } = useQuery({
    ...streamingQueries.data({
      animeId, 
      episodeNumber,
      provider: 'hianime'
    }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isLoading) {
      loadingStartTime.current = Date.now();
    } else if (streamingData && loadingStartTime.current > 0 && loadingDuration === 0) {
      const duration = Date.now() - loadingStartTime.current;
      setLoadingDuration(duration);
    }
  }, [isLoading, streamingData, loadingDuration]);

  return {
    streamingData,
    isLoading,
    error,
    loadingDuration,
    refetch
  };
}