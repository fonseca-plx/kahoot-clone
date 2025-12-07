import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateRandomName } from "@/lib/utils";

interface LocalUser {
  displayName: string;
  userId?: string;
  email?: string;
}

interface LocalUserState {
  user: LocalUser | null;
  
  setUser: (user: LocalUser) => void;
  setDisplayName: (name: string) => void;
  setUserId: (userId: string, email?: string) => void;
  clearUser: () => void;
  ensureDisplayName: () => string;
}

export const useLocalUserStore = create<LocalUserState>()(
  persist(
    (set, get) => ({
      user: null,
      
      setUser: (user) => set({ user }),
      
      setDisplayName: (name) => 
        set((state) => ({
          user: state.user ? { ...state.user, displayName: name } : { displayName: name }
        })),
      
      setUserId: (userId, email) =>
        set((state) => ({
          user: state.user ? { ...state.user, userId, email } : { displayName: generateRandomName(), userId, email }
        })),
      
      clearUser: () => set({ user: null }),
      
      ensureDisplayName: () => {
        const state = get();
        if (state.user?.displayName) {
          return state.user.displayName;
        }
        const randomName = generateRandomName();
        set({ user: { displayName: randomName } });
        return randomName;
      }
    }),
    {
      name: "local-user-storage"
    }
  )
);