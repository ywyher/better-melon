import { Anime } from "@/types/anime";
import { EpisodeData } from "@/types/episode";
import { create } from "zustand";

export type EpisodeStore = {
  animeId: Anime['id'];
  setAnimeId: (animeId: EpisodeStore['animeId']) => void;

  episodeNumber: number;
  setEpisodeNumber: (episodeNumber: EpisodeStore['episodeNumber']) => void;
  
  episodeData: EpisodeData | null;
  setEpisodeData: (episodeData: EpisodeStore['episodeData']) => void;
  
  episodesLength: number;
  setEpisodesLength: (episodesLength: EpisodeStore['episodesLength']) => void;

  batchUpdate: (updates: Partial<Omit<EpisodeStore, 'setAnimeId' | 'setEpisodeNumber' | 'setEpisodeData' | 'setEpisodesLength' | 'reset' | 'batchUpdate'>>) => void;
  reset: () => void;
};

export const useEpisodeStore = create<EpisodeStore>()((set) => ({
  animeId: 0,
  episodeNumber: 0,
  episodeData: null,
  episodesLength: 0,

  setAnimeId: (animeId) => set({ animeId }),
  setEpisodeNumber: (episodeNumber) => set({ episodeNumber }),
  
  setEpisodeData: (episodeData) => set({ episodeData }),
  setEpisodesLength: (episodesLength) => set({ episodesLength }),
  
  batchUpdate: (updates) => set((state) => ({ ...state, ...updates })),
  reset: () => set({
    animeId: 0,
    episodeNumber: 0,
    episodeData: null,
    episodesLength: 0,
  }),
}));