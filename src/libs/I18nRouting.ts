import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  pathnames: {
    '/': '/',
    '/courses': '/courses',
    '/auth/login': '/auth/login',
    '/auth/register': '/auth/register',
    '/auth/forgot-password': '/auth/forgot-password',
    '/auth/reset-password': '/auth/reset-password',
    '/auth/verify-email': '/auth/verify-email',

    // specify each external path per locale
    '/about': {
      en: '/about',
      vi: '/gioi-thieu'
    }
  }
});
