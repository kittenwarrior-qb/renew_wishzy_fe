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
        // Load all translation files from the locale directory
        const [auth, common, courses, navigation] = await Promise.all([
          import(`../../locales/${currentLocale}/auth.json`).catch(() => ({ default: {} })),
          import(`../../locales/${currentLocale}/common.json`).catch(() => ({ default: {} })),
          import(`../../locales/${currentLocale}/courses.json`).catch(() => ({ default: {} })),
          import(`../../locales/${currentLocale}/navigation.json`).catch(() => ({ default: {} })),
        ]);

        // Merge all translations
        const mergedTranslations = {
          auth: auth.default,
          common: common.default,
          courses: courses.default,
          navigation: navigation.default,
        };

        setTranslations(mergedTranslations);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Fallback to Vietnamese
        try {
          const [auth, common, courses, navigation] = await Promise.all([
            import(`../../locales/vi/auth.json`).catch(() => ({ default: {} })),
            import(`../../locales/vi/common.json`).catch(() => ({ default: {} })),
            import(`../../locales/vi/courses.json`).catch(() => ({ default: {} })),
            import(`../../locales/vi/navigation.json`).catch(() => ({ default: {} })),
          ]);

          const mergedTranslations = {
            auth: auth.default,
            common: common.default,
            courses: courses.default,
            navigation: navigation.default,
          };

          setTranslations(mergedTranslations);
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError);
          setTranslations({});
        }
      }
    };

    loadTranslations();
  }, [pathname]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations;
    
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
