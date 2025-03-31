import { JimakuFile } from "@/app/watch/[id]/[ep]/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WatchStore = {
  sub: JimakuFile | null;
  setSub: (sub: WatchStore['sub']) => void;
  reset: () => void;
};

export const useWatchStore = create<WatchStore>()(
  persist(
    (set) => ({
      sub: null,
      setSub: (sub: WatchStore['sub']) => set({ sub }),
      reset: () => {
        set({
          sub: null,
        });
      },
    }),
    {
      name: "watch-store", // Name of the storage key
      storage: createJSONStorage(() => localStorage), // Use sessionStorage
    },
  ),
);