import type { User } from '@/types/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hadAuthenticatedSession: boolean;
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
      hadAuthenticatedSession: false,
      login: (user: User, token: string) => {
        // Ensure user and token are valid before setting
        if (!user || !token) {
          console.warn('Login called with invalid user or token:', { user, token });
          return;
        }
        const isTokenValid = (() => {
          try {
            const parts = token.split('.');
            if (parts.length < 2) {
              return false;
            }
            const payloadB64: string = parts[1] ?? '';
            if (!payloadB64) {
              return false;
            }
            const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
            const exp = typeof payload.exp === 'number' ? payload.exp : 0;
            const now = Math.floor(Date.now() / 1000);
            return now < exp - 30; // 30s skew
          } catch {
            return false;
          }
        })();
        set({ user, token, isAuthenticated: !!user && !!token && isTokenValid, hadAuthenticatedSession: true });
      },
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          hadAuthenticatedSession: false,
        }),
      updateUser: (user: Partial<User>) =>
        set((state) => {
          const nextUser = state.user ? { ...state.user, ...user } : null;
          let valid = false;
          try {
            if (state.token) {
              const parts = state.token.split('.');
              if (parts.length >= 2) {
                const payloadB64: string = parts[1] ?? '';
                if (!payloadB64) {
                  valid = false;
                } else {
                  const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
                  const exp = typeof payload.exp === 'number' ? payload.exp : 0;
                  const now = Math.floor(Date.now() / 1000);
                  valid = now < exp - 30;
                }
              }
            }
          } catch {
            valid = false;
          }
          return { user: nextUser, isAuthenticated: nextUser !== null && state.token !== null && valid };
        }),
    }),
    {
      name: 'auth-storage',
      // On rehydrate, compute isAuthenticated from persisted user and token
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Recalculate isAuthenticated from user and token and ensure token is not expired
          const isExpired = (() => {
            try {
              if (!state.token) {
                return true;
              }
              const parts = state.token.split('.');
              if (parts.length < 2) {
                return true;
              }
              const payloadB64: string = parts[1] ?? '';
              if (!payloadB64) {
                return true;
              }
              const json = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
              const exp = typeof json.exp === 'number' ? json.exp : 0;
              const now = Math.floor(Date.now() / 1000);
              return now >= exp - 30; // 30s skew
            } catch {
              return true;
            }
          })();
          if (isExpired) {
            state.token = null;
          }
          state.isAuthenticated = state.user !== null && state.token !== null;
        }
      },
    },
  ),
);
