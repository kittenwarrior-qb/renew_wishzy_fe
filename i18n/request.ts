import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['vi', 'en'] as const;

export default getRequestConfig(async ({ locale }) => {
  if (!locale || !locales.includes(locale as any)) {
    notFound();
  }

  return {
    locale: locale as string,
    messages: (await import(`../locales/${locale}/common.json`)).default
  };
});
