'use client'

import { useMemo, useState, useEffect, useRef } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { playerQueries } from '@/lib/queries/player';
import { usePlayerStore } from '@/lib/stores/player-store';
import { ActiveSubtitleFile, SubtitleTranscription } from '@/types/subtitle';
import { getActiveSubtitleFile, getEnglishSubtitleUrl } from '@/lib/subtitle/utils';
import { subtitleQueries } from '@/lib/queries/subtitle';
import { useSubtitleStylesStore } from '@/lib/stores/subtitle-styles-store';

export function usePrefetchEpisode(
  animeId: string,
  episodeNumber: number,
  episodesLength: number,
  isVideoReady: boolean
) {
  const [networkCondition, setNetworkCondition] = useState<'good'|'poor'|'n'>('n');
  const storeActiveTranscriptions = usePlayerStore((state) => state.activeTranscriptions) || [];
  const isLastEpisode = episodesLength > 0 && episodeNumber >= episodesLength;
  const handleSubtitleStylesInStore = useSubtitleStylesStore((state) => state.handleStyles);
  const getStylesFromStore = useSubtitleStylesStore((state) => state.getStyles);


  useEffect(() => {
    const checkNetworkPerformance = async () => {
      try {
        // Simple test - check download speed with a tiny request
        const startTime = performance.now();
        const response = await fetch('/api/ping', { 
          method: 'HEAD',
          cache: 'no-store'
        });
        const endTime = performance.now();
        
        if (!response.ok) {
          setNetworkCondition('poor');
          return;
        }
        
        const responseTime = endTime - startTime;
        
        if (responseTime > 500) {
          console.debug(`Debug poor network condition: ${responseTime}`)
          setNetworkCondition('poor');
        } else {
          console.debug(`Debug good network condition: ${responseTime}`)
          setNetworkCondition('good');
        }
      } catch (error) {
        setNetworkCondition('poor');
        console.warn('Network quality check failed', error);
      }
    };
    
    checkNetworkPerformance();

    const intervalId = setInterval(checkNetworkPerformance, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const activeTranscriptions: SubtitleTranscription[] = useMemo(() => {
    if (!storeActiveTranscriptions.includes('japanese')) {
      return [...storeActiveTranscriptions, 'japanese'];
    }
    return storeActiveTranscriptions;
  }, [storeActiveTranscriptions]);
  
  const shouldFetchEpisodeData = useMemo(() => {
    return isVideoReady && 
           !isLastEpisode && 
           networkCondition !== 'poor';
  }, [isVideoReady, isLastEpisode, networkCondition]);
  
  const { 
    data: episodeData, 
    isSuccess: episodeDataFetched,
    isFetching: isEpisodeDataFetching
  } = useQuery({
    ...playerQueries.episodeData(animeId, episodeNumber),
    staleTime: 1000 * 60 * 45,
    enabled: !!shouldFetchEpisodeData
  });

  useEffect(() => {
    if (isEpisodeDataFetching) {
      console.info(`debug Started prefetching episode ${episodeNumber} data`);
    } else if (episodeDataFetched) {
      console.info(`debug Successfully prefetched episode ${episodeNumber} data`);
    }
  }, [isEpisodeDataFetching, episodeDataFetched, episodeNumber]);

  const shouldFetchSubtitles = useMemo(() => {
    return isVideoReady && 
           !isLastEpisode && 
           networkCondition !== 'poor';
  }, [isVideoReady, isLastEpisode, networkCondition]);

  const queries = useQueries({
    queries: activeTranscriptions.map((transcription) => {
      const isEnglish = transcription === 'english';
      const activeSubtitleFile = episodeData ? 
        getActiveSubtitleFile(episodeData.subtitles ?? []) : 
        undefined;
      const englishSubtitleUrl = episodeData ? 
        getEnglishSubtitleUrl(episodeData.streamingLinks?.tracks ?? []) : 
        '';
      
      return {
        ...subtitleQueries.transcriptions({
          activeSubtitleFile: activeSubtitleFile as ActiveSubtitleFile | undefined,
          englishSubtitleUrl,
          isEnglish,
          isTokenizerInitialized: true,
          transcription
        }),
        staleTime: 1000 * 60 * 60,
        enabled: !!shouldFetchSubtitles && 
                !!episodeDataFetched && 
                (
                  (isEnglish && !!englishSubtitleUrl) || 
                  (!isEnglish && !!activeSubtitleFile)
                )
      };
    })
  });
  
  const subtitlesPrefetched = useMemo(() => {
    if (queries.length === 0) return false;
    return queries.every(query => query.isSuccess);
  }, [queries]);

  useEffect(() => {
    if (subtitlesPrefetched) {
      console.info(`debug Successfully prefetched all subtitle transcriptions for episode ${episodeNumber}`);
    }
  }, [subtitlesPrefetched, episodeNumber]);

  const checkedTranscriptions = useRef<Set<SubtitleTranscription>>(new Set());

  const transcriptionsToFetch = useMemo(() => {
    if (!activeTranscriptions) return [];
    
    return activeTranscriptions.filter(transcription => {
      return !checkedTranscriptions.current.has(transcription);
    });
  }, [activeTranscriptions]);

  const shouldFetchStyles = useMemo(() => {
    return isVideoReady && 
           !isLastEpisode && 
           networkCondition !== 'poor' &&
           transcriptionsToFetch.length > 0;
  }, [isVideoReady, isLastEpisode, networkCondition]);

  const {
    data: stylesQuery,
    isLoading: isStylesQueryLoading
  } = useQuery({
    ...subtitleQueries.styles({
      handleSubtitleStylesInStore,
      checkedTranscriptions,
      getStylesFromStore,
      transcriptionsToFetch,
    }),
    enabled: shouldFetchStyles,
  });

  useEffect(() => {
    if (isStylesQueryLoading) {
      console.info(`debug Started prefetching episode ${episodeNumber} data`);
    } else if (stylesQuery) {
      console.info(`debug Successfully prefetched episode ${episodeNumber} data`);
    }
  }, [isEpisodeDataFetching, episodeDataFetched, episodeNumber]);

  return {
    isLastEpisode,
    episodeDataPrefetched: episodeDataFetched,
    subtitlesPrefetched,
    networkCondition
  };
}