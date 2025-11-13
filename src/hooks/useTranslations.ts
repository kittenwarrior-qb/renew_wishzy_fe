'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

type TranslationValue = string | Record<string, any>;

type Translations = {
  [key: string]: TranslationValue;
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
        const auth = await import(`../../locales/${currentLocale}/auth.json`);
        const common = await import(`../../locales/${currentLocale}/common.json`);
        const courses = await import(`../../locales/${currentLocale}/courses.json`);
        const navigation = await import(`../../locales/${currentLocale}/navigation.json`);
        
        setTranslations({
          auth: auth.default,
          common: common.default,
          courses: courses.default,
          navigation: navigation.default
        });
      } catch (error) {
        console.error('Failed to load translations:', error);
        try {
          const auth = await import(`../../locales/vi/auth.json`);
          const common = await import(`../../locales/vi/common.json`);
          const courses = await import(`../../locales/vi/courses.json`);
          const navigation = await import(`../../locales/vi/navigation.json`);
          
          setTranslations({
            auth: auth.default,
            common: common.default,
            courses: courses.default,
            navigation: navigation.default
          });
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
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && value !== null && k in value) {
        value = value[k];
      } else {
        return key; 
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t, locale };
}
