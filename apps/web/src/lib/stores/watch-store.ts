import { create } from 'zustand';

export type WatchStore = {
  isLoading: boolean;
  loadingDuration: number;
  setIsLoading: (isLoading: boolean) => void;
  setLoadingDuration: (duration: number) => void;
  
  reset: () => void;
}

export const useWatchStore = create<WatchStore>()((set) => ({
  isLoading: true,
  loadingDuration: 0,
  setIsLoading: (isLoading) => set({ isLoading }),
  setLoadingDuration: (loadingDuration) => set({ loadingDuration }),
  
  reset: () => set({ isLoading: true, loadingDuration: 0 }),
}));