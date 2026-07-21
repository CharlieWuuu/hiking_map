import { create } from 'zustand';

import { apiClient } from './apiClient';

type AuthState = {
  isLoggedIn: boolean;
  isLoading: boolean;
  userId: number | null;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  isLoading: true,
  userId: null,
  username: null,

  refresh: async () => {
    try {
      const profile = await apiClient.profile.getMe();
      set({ userId: profile.userId, username: profile.username, isLoggedIn: true });
    } catch {
      set({ userId: null, username: null, isLoggedIn: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (username, password) => {
    await apiClient.auth.login({ username, password });
    await get().refresh();
  },

  logout: async () => {
    await apiClient.auth.logout();
    set({ userId: null, username: null, isLoggedIn: false });
  },
}));
