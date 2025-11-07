import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['vi', 'en'],

  // Used when no locale matches
  defaultLocale: 'vi',

  // The `pathnames` object holds pairs of internal and
  // external paths. Based on the locale, the external
  // paths are rewritten to the shared, internal ones.
  pathnames: {
    // If all locales use the same pathname, a single
    // external path can be provided for all locales
    '/': '/',
    '/courses': '/courses',
    '/auth/login': '/auth/login',
    '/auth/register': '/auth/register',
    '/auth/forgot-password': '/auth/forgot-password',
    '/auth/reset-password': '/auth/reset-password',
    '/auth/verify-email': '/auth/verify-email',

    // If locales use different paths, you can
    // specify each external path per locale
    '/about': {
      en: '/about',
      vi: '/gioi-thieu'
    }
  }
});
