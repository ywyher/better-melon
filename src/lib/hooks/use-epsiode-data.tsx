import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePlayerStore } from '@/lib/stores/player-store';
import { selectSubtitleFile } from '@/lib/subtitle';
import { playerQueries } from '@/lib/queries/player';

export function useEpisodeData(animeId: string, episodeNumber: number) {
  const loadingStartTime = useRef<number>(0);
  const [loadingDuration, setLoadingDuration] = useState<number>(0);
  const { setEnglishSubtitleUrl, setActiveSubtitleFile } = usePlayerStore();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    ...playerQueries.episodeData(animeId, episodeNumber),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const currentEpisode = data?.episodesMetadata?.find((e) => e.number === episodeNumber);
  const episodesLength = data?.episodesMetadata?.length || 0;

  useEffect(() => {
    if (isLoading) {
      loadingStartTime.current = Date.now();
    } else if (data && loadingStartTime.current > 0 && loadingDuration === 0) {
      const duration = Date.now() - loadingStartTime.current;
      setLoadingDuration(duration);
    }
  }, [isLoading, data, loadingDuration]);

  useEffect(() => {
    if (!data || !data.episodeStreamingData) return;
    
    setActiveSubtitleFile(null);
    setEnglishSubtitleUrl(null);
    
    if (data.subtitleFiles?.length > 0) {
      const selected = selectSubtitleFile({ 
        files: data.subtitleFiles,
        preferredFormat: data.subtitleSettings?.preferredFormat || null,
        matchPattern: data.subtitleSettings?.matchPattern || null,
      });
      
      if (selected) {
        setActiveSubtitleFile({
          source: 'remote',
          file: {
            name: selected.name,
            url: selected.url,
            last_modified: selected.last_modified,
            size: selected.size
          }
        });
      }
    }
    
    if (data.episodeStreamingData.subtitles) {
      const englishSub = data.episodeStreamingData.subtitles.find(
        (s) => s.lang === 'English'
      )?.url || "";
      setEnglishSubtitleUrl(englishSub);
    }
  }, [data, setActiveSubtitleFile, setEnglishSubtitleUrl]);

  return {
    data,
    isLoading,
    error,
    loadingDuration,
    currentEpisode,
    episodesLength
  };
}