import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.athenoa.academy',
  // 'ignore' so the preview serves pages, and the 404 page, with or without a trailing slash.
  // Canonical URLs still carry the slash (see Seo.astro).
  trailingSlash: 'ignore',
  // The old site's addresses (Odoo, Greek at the root and English under /en/) lead to the same pages here,
  // so links already shared in emails and posts keep working (Maria, 22 November 2026).
  redirects: {
    '/en': '/',
    '/odusseia': '/el/courses/odusseia/',
    '/en/odusseia': '/courses/odusseia/',
    '/eu-zen': '/el/courses/eu-zen/',
    '/en/eu-zen': '/courses/eu-zen/',
    '/melos': '/el/courses/',
    '/en/melos': '/courses/',
    '/slides': '/el/courses/',
    '/en/slides': '/courses/',
    '/contactus': '/el/about-athena/#contact',
    '/en/contactus': '/about-athena/#contact',
    '/contactus-thank-you': '/el/',
    '/en/contactus-thank-you': '/',
  },
  integrations: [
    sitemap({
      // Working pages stay out of the sitemap
      filter: (page) => !['/lab/', '/el/lab/', '/font-test/', '/grc/', '/nostos/', '/el/nostos/'].some((part) => new URL(page).pathname.startsWith(part)),
      i18n: { defaultLocale: 'en', locales: { en: 'en', el: 'el' } },
    }),
  ],
  devToolbar: { enabled: false },
  // the Anthropic SDK is loaded only when the tutor is used; prepared with the rest in development, so
  // the dev server never serves a stale copy of it
  vite: { optimizeDeps: { include: ['@anthropic-ai/sdk', '@anthropic-ai/sdk/helpers/json-schema'] } },
  server: { port: 4321 },
});
