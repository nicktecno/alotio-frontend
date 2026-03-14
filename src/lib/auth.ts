'use client';

import { create } from 'zustand';
import { api, clearApiCache } from './api';

interface AuthState {
  user: { id: string; email: string; role: string } | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: async (email, password) => {
    const res = await api.login({ email, password });
    set({ user: res.user });
  },

  register: async (email, password) => {
    await api.register({ email, password });
  },

  logout: async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    }
    clearApiCache();
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const user = await api.me();
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
