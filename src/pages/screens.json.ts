// The website's own words for the screens the team can change from the dashboard's Screens tab (Maria,
// 28 November 2026), built with the site: { "<screen>.<locale>": { kicker?, title?, text } }. The dashboard
// shows them as the originals; a line break inside a text is "\n". See src/scripts/screen-texts.ts.
import type { APIRoute } from 'astro';
import { content } from '../data';
import { paymentWords } from '../data/payment';
import { newsletter } from '../data/newsletter';
import type { Locale } from '../lib/locale';

const locales: Locale[] = ['el', 'en', 'grc'];

export const GET: APIRoute = () => {
  const screens: Record<string, Record<string, string>> = {};
  for (const locale of locales) {
    const { ui } = content(locale).coursesPage;
    const pay = paymentWords[locale];
    for (const kind of ['success', 'membership', 'failed'] as const) {
      const { kicker, title, text } = pay[kind];
      screens[`payment-${kind}.${locale}`] = { kicker, title, text: text.join('\n') };
    }
    screens[`registration-bank.${locale}`] = { title: ui.register.doneTitle, text: ui.register.doneBank };
    screens[`waitlist.${locale}`] = { text: ui.waitlist.thanks };
    screens[`newsletter.${locale}`] = { text: newsletter[locale].pending };
  }
  return new Response(JSON.stringify(screens, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
