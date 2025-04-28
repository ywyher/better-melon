import { create } from 'zustand'

type AuthStore = {
  isAuthDialogOpen: boolean;
  setIsAuthDialogOpen: (isAuthDialogOpen: AuthStore['isAuthDialogOpen']) => void;
}

export const useAuthStore = create<AuthStore>()(
  (set) => ({
    isAuthDialogOpen: false,
    setIsAuthDialogOpen: (isAuthDialogOpen: AuthStore['isAuthDialogOpen']) => set({ isAuthDialogOpen }),
  })
);