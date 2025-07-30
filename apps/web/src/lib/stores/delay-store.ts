import { SubtitleDelay } from '@/types/subtitle';
import { create } from 'zustand'

export type DelayStore = {
  delay: SubtitleDelay
  setDelay: (sub: DelayStore['delay']) => void;
}

export const useDelayStore = create<DelayStore>()(
  (set) => ({
    delay: {
      japanese: -118,
      english: 0
    },
    setDelay: (delay: DelayStore['delay']) => set({ delay }),

    reset: () => {
      set({
        delay: {
          japanese: -118,
          english: 0,
        }
      })
    }
  })
);