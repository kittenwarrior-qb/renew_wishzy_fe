'use client';

import { ActionIcon, Tooltip } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/libs/I18nNavigation';
import { routing } from '@/libs/I18nRouting';
import { useLocaleStore } from '@/stores/useLocaleStore';

export const LocaleSwitcher = () => {
  const router = useRouter();
  const locale = useLocale();
  const { setLocale: setStoredLocale } = useLocaleStore();

  const toggleLocale = () => {
    const newLocale = locale === 'vi' ? 'en' : 'vi';

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

    let cleanPath = currentPath;
    if (cleanPath.startsWith('/en/')) {
      cleanPath = cleanPath.slice(4);
    } else if (cleanPath === '/en') {
      cleanPath = '/';
    } else if (cleanPath.startsWith('/vi/')) {
      cleanPath = cleanPath.slice(4);
    } else if (cleanPath === '/vi') {
      cleanPath = '/';
    }

    if (!cleanPath.startsWith('/')) {
      cleanPath = `/${cleanPath}`;
    }
    if (cleanPath === '') {
      cleanPath = '/';
    }

    let newPath: string;
    if (newLocale === routing.defaultLocale) {
      newPath = cleanPath;
    } else {
      newPath = cleanPath === '/' ? `/${newLocale}` : `/${newLocale}${cleanPath}`;
    }

    setStoredLocale(newLocale);

    if (typeof window !== 'undefined' && window.location.pathname !== newPath) {
      window.location.href = newPath;
    } else {
      router.replace(newPath);
      router.refresh();
    }
  };

  return (
    <Tooltip label={locale.toUpperCase()}>
      <ActionIcon variant="subtle" size="lg" onClick={toggleLocale} aria-label="Toggle locale">
        <IconLanguage size={18} />
      </ActionIcon>
    </Tooltip>
  );
};
