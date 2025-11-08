import { create } from "zustand";
import { persist } from "zustand/middleware";

// Persist the token to localStorage so it survives reload
type S = { token: string | null; setToken: (t: string | null) => void };

export const useAuth = create<S>()(
  persist(
    (set) => ({
      token: null,
      setToken: (t) => set({ token: t }),
    }),
    {
      name: "auth", // stored in localStorage key = 'auth'
    }
  )
);
