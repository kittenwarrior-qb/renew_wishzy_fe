'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((state) => state.theme);
  const hasHydrated = useAppStore((state) => state._hasHydrated);

  useEffect(() => {
    const root = document.documentElement;
    
    try {
      const stored = localStorage.getItem('user-storage');
      if (stored) {
        const { state } = JSON.parse(stored);
        if (state?.theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }, []); // Run once on mount

  // Apply theme when it changes from store
  useEffect(() => {
    if (!hasHydrated) return;

    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, hasHydrated]);

  return <>{children}</>;
}
