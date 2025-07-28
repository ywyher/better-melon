import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { SubtitleCue } from '@/types/subtitle';
import { chunkArray } from '@/lib/utils/utils';
import { getActiveSubtitleFile } from '@/lib/utils/subtitle';
import { SubtitleSettings } from '@/lib/db/schema';
import { pitchQueries } from '@/lib/queries/pitch';
import { Anime } from '@/types/anime';
import { pitchAccentConfig } from '@/lib/hooks/use-pitch-accent-chunks';
import { NetworkCondition } from '@/types';
import { EpisodeData } from '@/types/episode';

type PrefetchPitchAccentProps = {
  animeId: Anime['id'],
  episodeNumber: number,
  episodeData: EpisodeData | undefined,
  japaneseCues: SubtitleCue[] | undefined,
  preferredFormat: SubtitleSettings["preferredFormat"],
  networkCondition: NetworkCondition,
  isReady: boolean,
  isLastEpisode: boolean
}

export function usePrefetchPitchAccent({
  animeId,
  episodeNumber,
  episodeData,
  japaneseCues,
  preferredFormat,
  networkCondition,
  isReady,
  isLastEpisode
}: PrefetchPitchAccentProps) {
  const chunks = useMemo(() => {
    if (!japaneseCues || !japaneseCues.length) return [];
    
    const tokens = japaneseCues.flatMap((c) =>
      c.tokens?.flatMap((t) => t.original_form ?? []) ?? []
    ).filter(Boolean);
    
    const deduplicatedTokens = Array.from(new Set(tokens));
    return chunkArray(deduplicatedTokens, pitchAccentConfig.chunkSize);
  }, [japaneseCues]);
  
  const subtitleFileName = useMemo(() => {
    if (!episodeData) return '';
    
    try {
      const activeSubtitleFile = getActiveSubtitleFile(
        episodeData.subtitles ?? [], 
        preferredFormat
      );
      return activeSubtitleFile?.file.name || '';
    } catch {
      return '';
    }
  }, [episodeData, preferredFormat]);
  
    const shouldFetchPitchAccentChunks = useMemo(() => {
      return isReady &&
             !isLastEpisode && 
             networkCondition !== 'poor' &&
             chunks.length > 0 &&
             episodeData != null &&
             japaneseCues?.length &&
             subtitleFileName != null;
    }, [isReady, isLastEpisode, networkCondition, chunks.length]);
  
  const queries = useQueries({
    queries: chunks.map((chunk, index) => {
      return {
        ...pitchQueries.accentChunk(
          chunk, 
          index, 
          animeId, 
          subtitleFileName,
          pitchAccentConfig.delayBetweenRequests,
        ),
        staleTime: 1000 * 60 * 60,
        enabled: !!shouldFetchPitchAccentChunks
      }
    }
      
    )
  });

  const pitchAccentPrefetched = useMemo(() => {
    if (queries.length === 0) return false;
    return queries.every(query => query.isSuccess);
  }, [queries]);

  // useEffect(() => {
  //   if (pitchAccentPrefetched && queries.length > 0) {
  //     console.info(`debug Successfully prefetched pitch accent data for episode ${episodeNumber}`);
  //   }
  // }, [pitchAccentPrefetched, episodeNumber, queries.length]);

  return {
    pitchAccentPrefetched,
    chunks: chunks.length,
  };
}