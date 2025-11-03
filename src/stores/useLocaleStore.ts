import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LocaleState = {
  locale: string;
  setLocale: (locale: string) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    set => ({
      locale: 'vi',
      setLocale: locale => set({ locale }),
    }),
    {
      name: 'locale-storage',
    },
  ),
);
