import { create } from 'zustand';

type SessionState = {
  displayName: string | null;
  setDisplayName: (name: string | null) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  displayName: null,
  setDisplayName: (displayName) => set({ displayName }),
}));
