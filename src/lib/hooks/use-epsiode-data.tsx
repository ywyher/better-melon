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
    data: episodeContext,
    isLoading,
    error,
  } = useQuery({
    ...playerQueries.episodeData(animeId, episodeNumber),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  
  useEffect(() => {
    if(!episodeContext) return;
    setEpisodesLength(episodeContext.data.details.episodes);
  }, [episodeContext])

  useEffect(() => {
    if (isLoading) {
      loadingStartTime.current = Date.now();
    } else if (episodeContext && loadingStartTime.current > 0 && loadingDuration === 0) {
      const duration = Date.now() - loadingStartTime.current;
      setLoadingDuration(duration);
    }
  }, [isLoading, episodeContext, loadingDuration]);

  useEffect(() => {
    if (!episodeContext || !episodeContext.data.streamingLinks) return;
    
    setActiveSubtitleFile(null);
    setEnglishSubtitleUrl(null);

    console.log(selectSubtitleFile({ 
      files: episodeContext.data.subtitles,
      preferredFormat: 'srt'
    }))
    console.log(episodeContext.data.streamingLinks.tracks.find(
      (s: AnimeStreamingLinks['tracks'][0]) => s.label === 'English'
    )?.file)
    
    if (episodeContext.data.subtitles?.length > 0) {
      const selected = selectSubtitleFile({ 
        files: episodeContext.data.subtitles,
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
    
    if (episodeContext.data.streamingLinks.tracks) {
      const englishSub = episodeContext.data.streamingLinks.tracks.find(
        (s: AnimeStreamingLinks['tracks'][0]) => s.label === 'English'
      )?.file || "";
      setEnglishSubtitleUrl(englishSub);
    }
  }, [episodeContext, setActiveSubtitleFile, setEnglishSubtitleUrl]);

  return {
    episodeContext,
    isLoading,
    error,
    loadingDuration,
    episodesLength
  };
}