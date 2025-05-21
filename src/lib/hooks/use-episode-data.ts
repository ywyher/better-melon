import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePlayerStore } from '@/lib/stores/player-store';
import { selectSubtitleFile } from '@/lib/subtitle/utils';
import { playerQueries } from '@/lib/queries/player';
import { AnimeStreamingLinks } from '@/types/anime';

export function useEpisodeData(animeId: string, episodeNumber: number) {
  const loadingStartTime = useRef<number>(0);
  const [episodesLength, setEpisodesLength] = useState<number>(0)
  const [loadingDuration, setLoadingDuration] = useState<number>(0);
  const { setEnglishSubtitleUrl, setActiveSubtitleFile } = usePlayerStore();

  const {
    data: episodeData,
    isLoading,
    error,
  } = useQuery({
    ...playerQueries.episodeData(animeId, episodeNumber),
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

  useEffect(() => {
    if (!episodeData || !episodeData.streamingLinks) return;
    
    setActiveSubtitleFile(null);
    setEnglishSubtitleUrl(null);

    console.log(selectSubtitleFile({ 
      files: episodeData.subtitles,
      preferredFormat: 'srt'
    }))
    console.log(episodeData.streamingLinks.tracks.find(
      (s: AnimeStreamingLinks['tracks'][0]) => s.label === 'English'
    )?.file)
    
    if (episodeData.subtitles?.length > 0) {
      const selected = selectSubtitleFile({ 
        files: episodeData.subtitles,
        preferredFormat: 'srt'
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
    
    if (episodeData.streamingLinks.tracks) {
      const englishSub = episodeData.streamingLinks.tracks.find(
        (s: AnimeStreamingLinks['tracks'][0]) => s.label === 'English'
      )?.file || "";
      setEnglishSubtitleUrl(englishSub);
    }
  }, [episodeData, setActiveSubtitleFile, setEnglishSubtitleUrl]);

  return {
    episodeData,
    isLoading,
    error,
    loadingDuration,
    episodesLength
  };
}