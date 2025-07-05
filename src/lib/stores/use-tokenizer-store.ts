import { create } from 'zustand'

type TokenizerStore = {
  isInitialized: boolean;
  setIsInitialized: (isInitialized: TokenizerStore['isInitialized']) => void;
}

export const useTokenizerStore = create<TokenizerStore>()(
  (set) => ({
    isInitialized: false,
    setIsInitialized: (isInitialized: TokenizerStore['isInitialized']) => set({ isInitialized }),
  })
);