import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.athenoa.academy',
  // 'ignore' so the preview serves pages, and the 404 page, with or without a trailing slash.
  // Canonical URLs still carry the slash (see Seo.astro).
  trailingSlash: 'ignore',
  // The old site's addresses (Odoo: Greek at the root, English under /en/, as here) lead to the same pages,
  // so links already shared in emails and posts keep working (Maria, 22 November 2026).
  redirects: {
    '/odusseia': '/courses/odusseia/',
    '/en/odusseia': '/en/courses/odusseia/',
    '/eu-zen': '/courses/eu-zen/',
    '/en/eu-zen': '/en/courses/eu-zen/',
    '/melos': '/membership/',
    '/en/melos': '/en/membership/',
    '/slides': '/courses/',
    '/en/slides': '/en/courses/',
    '/contactus': '/about-athena/#contact',
    '/en/contactus': '/en/about-athena/#contact',
    '/contactus-thank-you': '/',
    '/en/contactus-thank-you': '/en/',
  },
  integrations: [
    sitemap({
      // Working pages stay out of the sitemap
      filter: (page) => !['/lab/', '/en/lab/', '/font-test/', '/grc/', '/nostos/', '/en/nostos/', '/payment/', '/en/payment/'].some((part) => new URL(page).pathname.startsWith(part)),
      i18n: { defaultLocale: 'el', locales: { el: 'el', en: 'en' } },
    }),
  ],
  devToolbar: { enabled: false },
  // the Anthropic SDK is loaded only when the tutor is used; prepared with the rest in development, so
  // the dev server never serves a stale copy of it
  vite: { optimizeDeps: { include: ['@anthropic-ai/sdk', '@anthropic-ai/sdk/helpers/json-schema'] } },
  server: { port: 4321 },
});
