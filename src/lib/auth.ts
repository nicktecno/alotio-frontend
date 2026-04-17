'use client';

import { create } from 'zustand';
import { api } from './api';
import { clearSwrCache } from './swr';

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  /** Conta com e-mail provisório (import); precisa informar e-mail real no app. */
  mustCaptureEmail?: boolean;
};

interface AuthState {
  user: AuthUser | null;
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
    set({
      user: {
        ...res.user,
        mustCaptureEmail: res.user.mustCaptureEmail ?? false,
      },
    });
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
    clearSwrCache();
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const user = await api.me();
      set({
        user: {
          ...user,
          mustCaptureEmail: user.mustCaptureEmail ?? false,
        },
        isLoading: false,
      });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
