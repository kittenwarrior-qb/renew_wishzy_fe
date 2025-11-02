import type { User } from '@/types/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user: User, token: string) => {
        // Ensure user and token are valid before setting
        if (!user || !token) {
          console.warn('Login called with invalid user or token:', { user, token });
          return;
        }
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
      updateUser: (user: Partial<User>) =>
        set(state => ({
          user: state.user ? { ...state.user, ...user } : null,
          // Keep isAuthenticated in sync with user and token
          isAuthenticated: state.user !== null && state.token !== null,
        })),
    }),
    {
      name: 'auth-storage',
      // On rehydrate, compute isAuthenticated from persisted user and token
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Recalculate isAuthenticated from user and token
          state.isAuthenticated = state.user !== null && state.token !== null;
        }
      },
    },
  ),
);
