'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

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

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const profile = await apiClient.profile.getMe();
      setUserId(profile.userId);
      setUsername(profile.username);
    } catch {
      setUserId(null);
      setUsername(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (username: string, password: string) => {
      await apiClient.auth.login({ username, password });
      await refresh();
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    await apiClient.auth.logout();
    setUserId(null);
    setUsername(null);
  }, []);

  return <AuthContext.Provider value={{ isLoggedIn: userId !== null, isLoading, userId, username, login, logout, refresh }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必須在 AuthProvider 底下使用');
  return ctx;
}
