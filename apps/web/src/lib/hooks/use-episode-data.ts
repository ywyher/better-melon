import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { episodeQueries } from '@/lib/queries/episode';
import { Anime } from '@/types/anime';

export function useEpisodeData(animeId: Anime['id'], episodeNumber: number) {
  const loadingStartTime = useRef<number>(0);
  const [episodesLength, setEpisodesLength] = useState<number>(0)
  const [loadingDuration, setLoadingDuration] = useState<number>(0);

  const {
    data: episodeData,
    isLoading,
    error,
    refetch
  } = useQuery({
    ...episodeQueries.data(animeId, episodeNumber),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  
  useEffect(() => {
    if(!episodeData) return;
    setEpisodesLength(episodeData.details.episodes);
  }, [episodeData])

  useEffect(() => {
    if (isLoading) {
      loadingStartTime.current = Date.now();
    } else if (episodeData && loadingStartTime.current > 0 && loadingDuration === 0) {
      const duration = Date.now() - loadingStartTime.current;
      setLoadingDuration(duration);
    }
  }, [isLoading, episodeData, loadingDuration]);

  return {
    episodeData,
    isLoading,
    error,
    loadingDuration,
    episodesLength,
    refetch
  };
}