import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocalUserState {
  displayName: string | null;
  
  setDisplayName: (name: string) => void;
  clearDisplayName: () => void;
}

export const useLocalUserStore = create<LocalUserState>()(
  persist(
    (set) => ({
      displayName: null,
      
      setDisplayName: (name) => set({ displayName: name }),
      
      clearDisplayName: () => set({ displayName: null })
    }),
    {
      name: "local-user-storage"
    }
  )
);