'use client';

import { useEffect } from 'react';
import { routing } from '@/libs/I18nRouting';
import { useLocaleStore } from '@/stores/useLocaleStore';

export function LocaleInitializer() {
  const { locale: storedLocale, setLocale } = useLocaleStore();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!storedLocale) {
      setLocale(routing.defaultLocale);
    }
  }, [setLocale, storedLocale]);

  return null;
}
