import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ColorScheme = 'light' | 'dark';

type ThemeState = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
  clearColorScheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      colorScheme: 'light',
      setColorScheme: (scheme: ColorScheme) => set({ colorScheme: scheme }),
      toggleColorScheme: () => {
        const current = get().colorScheme;
        set({ colorScheme: current === 'dark' ? 'light' : 'dark' });
      },
      clearColorScheme: () => set({ colorScheme: 'light' }),
    }),
    { name: 'theme-storage' },
  ),
);
