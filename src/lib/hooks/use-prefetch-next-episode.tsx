'use client'

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { playerQueries } from '@/lib/queries/player';

export function usePrefetchNextEpisode(
  animeId: string,
  episodeNumber: number,
  episodesLength: number,
  enabled: boolean
) {
  console.debug(`prefetch enabled: ${enabled}`)
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if ((episodeNumber < episodesLength) && enabled) {
      const nextEpisodeNumber = episodeNumber + 1;
      
      (async () => {
        try {
          await queryClient.prefetchQuery({
            ...playerQueries.episodeData(animeId, nextEpisodeNumber),
            staleTime: 1000 * 60 * 5,
          });
          // console.log(`Prefetched episode ${nextEpisodeNumber} successfully`);
        } catch (error) {
          console.error(`Failed to prefetch episode ${nextEpisodeNumber}:`, error);
        }
      })();
    }
  }, [animeId, episodeNumber, episodesLength, queryClient, enabled]);
}