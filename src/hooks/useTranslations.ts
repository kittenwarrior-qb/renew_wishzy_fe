'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

type Translations = {
  [key: string]: unknown;
};

export function useTranslations() {
  const pathname = usePathname();
  const [translations, setTranslations] = useState<Translations>({});
  const [locale, setLocale] = useState<string>('vi');

  useEffect(() => {
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'vi';
    setLocale(currentLocale);

    const loadTranslations = async () => {
      try {
        const messages = await import(`../../locales/${currentLocale}.json`);
        setTranslations(messages.default);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Fallback to Vietnamese
        const fallback = await import(`../../locales/vi.json`);
        setTranslations(fallback.default);
      }
    };

    loadTranslations();
  }, [pathname]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t, locale };
}
