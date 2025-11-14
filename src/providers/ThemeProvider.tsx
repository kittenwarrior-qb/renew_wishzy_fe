'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((state) => state.theme);
  const hasHydrated = useAppStore((state) => state._hasHydrated);

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
