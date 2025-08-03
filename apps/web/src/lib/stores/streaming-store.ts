import { Anime } from '@/types/anime';
import { StreamingData } from '@better-melon/shared/types';
import { create } from 'zustand';

export type StreamingStore = {
  animeId: Anime['id'];
  setAnimeId: (animeId: StreamingStore['animeId']) => void;

  episodeNumber: number;
  setEpisodeNumber: (episodeNumber: StreamingStore['episodeNumber']) => void;
  
  streamingData: StreamingData | null;
  setStreamingData: (streamingData: StreamingStore['streamingData']) => void;
  
  isLoading: boolean;
  loadingDuration: number;

  setIsLoading: (isLoading: boolean) => void;
  setLoadingDuration: (duration: number) => void;
  
  batchUpdate: (updates: Partial<Omit<StreamingStore, 'setAnimeId' | 'setEpisodeNumber' | 'setStreamingData' | 'setEpisodesLength' | 'reset' | 'batchUpdate'>>) => void;
  reset: () => void;
}

export const useStreamingStore = create<StreamingStore>()((set) => ({
  animeId: 0,
  episodeNumber: 0,
  streamingData: null,

  setAnimeId: (animeId) => set({ animeId }),
  setEpisodeNumber: (episodeNumber) => set({ episodeNumber }),
  
  setStreamingData: (streamingData) => set({ streamingData }),
  
  isLoading: true,
  loadingDuration: 0,

  setIsLoading: (isLoading) => set({ isLoading }),
  setLoadingDuration: (loadingDuration) => set({ loadingDuration }),
  
  batchUpdate: (updates) => set((state) => ({ ...state, ...updates })),
  reset: () => set({
    animeId: 0,
    episodeNumber: 0,
    streamingData: null,
    isLoading: true, 
    loadingDuration: 0 
  }),
}));