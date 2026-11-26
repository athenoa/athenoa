// Sends the welcome email to a new newsletter sign-up (Maria, 23 November 2026).
// Called by a database trigger on public.newsletter with { id }. It sends only to a row that exists,
// was created in the last 15 minutes and has had no welcome yet, so the public endpoint cannot be used
// to send mail to anyone else. Secrets: RESEND_API_KEY (set in the dashboard); optional EMAIL_FROM,
// SITE_URL, ASSETS_URL.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.45.4';

const SITE = Deno.env.get('SITE_URL') ?? 'https://www.athenoa.academy';
// the email's template and pictures, on the site itself
const ASSETS = Deno.env.get('ASSETS_URL') ?? 'https://www.athenoa.academy/email';
// from the Academy's own address (athenoa.academy verified in Resend, 24 November 2026)
const FROM = Deno.env.get('EMAIL_FROM') ?? 'ATHENOA <philathenea@athenoa.academy>';
const FUNCTIONS = `${Deno.env.get('SUPABASE_URL')}/functions/v1`;

// An email's HTML: the dashboard's edited version if there is one, else the file on the site
async function template(db: SupabaseClient, key: string): Promise<string | null> {
  try {
    const { data, error } = await db.from('email_templates').select('html').eq('key', key).maybeSingle();
    if (error) console.error('email_templates', error.message);
    else if (data?.html) return data.html as string;
  } catch (e) {
    console.error('email_templates', String(e));
  }
  const page = await fetch(`${ASSETS}/${key}.html`);
  if (!page.ok) {
    console.error('template', key, page.status);
    return null;
  }
  return await page.text();
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });
  let id = '';
  try {
    id = String((await req.json()).id ?? '');
  } catch {
    return new Response('bad request', { status: 400 });
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response('bad request', { status: 400 });

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: row } = await db
    .from('newsletter')
    .select('id, email, locale, created_at, welcome_sent_at, unsubscribed_at')
    .eq('id', id)
    .maybeSingle();
  if (!row || row.welcome_sent_at || row.unsubscribed_at) return new Response('nothing to send', { status: 200 });
  if (Date.now() - new Date(row.created_at).getTime() > 15 * 60 * 1000) return new Response('too old', { status: 200 });

  // in the language of the page they signed up on (Maria, 23 November 2026): English pages get the
  // English email; Greek and Ancient Greek pages the Greek one
  const lang = row.locale === 'en' ? 'en' : 'el';
  // the email itself lives with the site (public/email/newsletter-welcome.<lang>.html)
  // the words edited in the dashboard's Email tab win when there are any (public.email_templates, Maria,
  // 26 November 2026); a failed read falls back to the file, so an error never stops the email
  const text = await template(db, `newsletter-welcome.${lang}`);
  if (!text) return new Response('template missing', { status: 502 });
  // the subject is the email's own title, so an edited subject goes out too
  const subject = text.match(/<title>([^<]+)<\/title>/)?.[1] ?? (lang === 'en' ? 'Welcome to ATHENOA' : 'Καλώς ήρθατε στην ΑΘΕΝΟΑ');
  const html = text
    .replaceAll('{{SITE}}', SITE)
    .replaceAll('{{ASSETS}}', ASSETS)
    .replaceAll('{{UNSUBSCRIBE_URL}}', `${FUNCTIONS}/newsletter-unsubscribe?id=${row.id}`);

  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [row.email],
      reply_to: 'philathenea@athenoa.academy',
      subject,
      html,
      headers: { 'List-Unsubscribe': `<${FUNCTIONS}/newsletter-unsubscribe?id=${row.id}>` },
    }),
  });
  const result = await sent.text();
  if (!sent.ok) {
    console.error('resend', sent.status, result);
    return new Response('send failed', { status: 502 });
  }
  await db.from('newsletter').update({ welcome_sent_at: new Date().toISOString() }).eq('id', row.id);
  return new Response('sent', { status: 200 });
});
