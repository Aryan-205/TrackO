import { create } from 'zustand';

interface AuthState {
  lastUrl: string | null;
  setLastUrl: (url: string) => void;
}

export const store = create<AuthState>((set) => ({

  lastUrl: null, 
  setLastUrl: (url) => set({ lastUrl: url }),

}));