// Texts the team can change from the dashboard's Screens tab (Maria, 28 November 2026): the thank-you and
// failure screens after paying, the bank-transfer thanks, the waitlist and newsletter thanks. Each screen keeps
// its own words in the page; a row in public.screen_texts (key "<screen>.<locale>") replaces any field it has.
// A missing row or field, a failed or slow request: the page's own words stay. The originals are published at
// /screens.json (src/pages/screens.json.ts) for the dashboard to show.
const URL = 'https://czfcjxzngedjjskybvos.supabase.co/rest/v1/screen_texts';
const KEY = 'sb_publishable_UsD5ub8WtH_XAnwxU0OrtA_HIjD5H2C';

export type Fields = Partial<Record<'kicker' | 'title' | 'text', string>>;

const pageLocale = () => location.pathname.match(/^\/(en|grc)(?=\/|$)/)?.[1] ?? 'el';

/** The team's fields for this screen in the page's language, or {} (never waits longer than `ms`). */
export async function screenTexts(screen: string, ms = 1500): Promise<Fields> {
  const abort = new AbortController();
  const timer = window.setTimeout(() => abort.abort(), ms);
  try {
    const key = encodeURIComponent(`${screen}.${pageLocale()}`);
    const response = await fetch(`${URL}?select=fields&key=eq.${key}`, {
      headers: { apikey: KEY },
      signal: abort.signal,
    });
    if (!response.ok) return {};
    const rows = (await response.json()) as { fields?: Record<string, unknown> }[];
    const fields = rows[0]?.fields ?? {};
    const out: Fields = {};
    for (const name of ['kicker', 'title', 'text'] as const) {
      const value = fields[name];
      if (typeof value === 'string' && value.trim()) out[name] = value;
    }
    return out;
  } catch {
    return {};
  } finally {
    window.clearTimeout(timer);
  }
}

/** Puts plain text in an element, a line break for each "\n" (never as HTML). */
export function setText(el: HTMLElement | null | undefined, value: string | undefined) {
  if (!el || value === undefined) return;
  el.replaceChildren(...value.split('\n').flatMap((line, i) => (i ? [document.createElement('br'), line] : [line])));
}
