// "Η εγγραφή ολοκληρώθηκε": the email a student gets once their registration is paid, by card through Stripe
// or by bank transfer marked paid in the dashboard (Maria, 26 November 2026). Called by the database trigger
// registrations_confirm_paid with { id } whenever a registration's payment_status becomes 'paid'. It sends
// only to the registrant's own address, only for a paid registration, and only once (confirmation_sent_at).
// The email: payment-confirmed.<course>.<lang> if the course has its own, else payment-confirmed.<lang>; the
// version edited in the dashboard's Email tab (public.email_templates) wins over the file on the site.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.45.4';

const SITE = Deno.env.get('SITE_URL') ?? 'https://www.athenoa.academy';
const ASSETS = Deno.env.get('ASSETS_URL') ?? `${SITE}/email`;
const FROM = Deno.env.get('EMAIL_FROM') ?? 'ATHENOA <philathenea@athenoa.academy>';

// What they paid for, as the shared email's sentence needs it ("η θέση σας … εξασφαλίστηκε")
const PLACE: Record<string, { el: string; en: string }> = {
  odusseia: { el: 'στον Κύκλο Σπουδών «Οδύσσεια»', en: 'in the Cycle of Studies “Odyssey”' },
  'eu-zen': { el: 'στον Κύκλο Σπουδών «Εὖ Ζῆν»', en: 'in the Cycle of Studies “Eu Zen”' },
  membership: { el: 'ως Μέλος της Ακαδημίας', en: 'as a Member of the Academy' },
};

// "Αγαπητή Μαρία," / "Αγαπητέ Γιώργο,": Greek men's names end in ς and take the vocative (-ος → -ο or -ε,
// -ας → -α, -ης → -η); other Greek names are taken as women's. Not in Greek letters, or none: "Αγαπητή/έ".
const vowels = (w: string) => (w.normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[αεηιουω]+/gi) ?? []).length;
function greekGreeting(raw: string) {
  const name = raw.trim().split(/\s+/)[0] ?? '';
  if (!name) return 'Αγαπητή/έ φίλη/ε,';
  if (!/^[Ͱ-Ͽἀ-῿]+$/.test(name)) return `Αγαπητή/έ ${name},`;
  const cap = name[0].toUpperCase() + name.slice(1);
  if (/ς$/.test(cap)) {
    let voc = cap;
    if (/ος$/.test(cap)) voc = vowels(cap) <= 2 ? cap.slice(0, -1) : cap.slice(0, -2) + 'ε';
    else voc = cap.slice(0, -1);
    return `Αγαπητέ ${voc},`;
  }
  return `Αγαπητή ${cap},`;
}

// An email's HTML: the dashboard's edited version if there is one, else the file on the site. A failed read
// falls back to the file: it never stops the email.
async function template(db: SupabaseClient, key: string): Promise<string | null> {
  try {
    const { data, error } = await db.from('email_templates').select('html').eq('key', key).maybeSingle();
    if (error) console.error('email_templates', error.message);
    else if (data?.html) return data.html as string;
  } catch (e) {
    console.error('email_templates', String(e));
  }
  const page = await fetch(`${ASSETS}/${key}.html`);
  return page.ok ? await page.text() : null;
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
    .from('registrations')
    .select('id, email, first_name, course, locale, payment_status, confirmation_sent_at')
    .eq('id', id)
    .maybeSingle();
  if (!row || row.payment_status !== 'paid' || row.confirmation_sent_at || !row.email) {
    return new Response('nothing to send', { status: 200 });
  }
  // claim it first, so two calls can never send it twice
  const { data: claimed } = await db
    .from('registrations')
    .update({ confirmation_sent_at: new Date().toISOString() })
    .eq('id', id)
    .is('confirmation_sent_at', null)
    .select('id');
  if (!claimed?.length) return new Response('nothing to send', { status: 200 });

  const lang = row.locale === 'en' ? 'en' : 'el';
  const text = (await template(db, `payment-confirmed.${row.course}.${lang}`)) ?? (await template(db, `payment-confirmed.${lang}`));
  const release = () => db.from('registrations').update({ confirmation_sent_at: null }).eq('id', id);
  if (!text) {
    console.error('template missing', row.course, lang);
    await release();
    return new Response('template missing', { status: 502 });
  }
  const name = (row.first_name ?? '').trim();
  // the subject is the email's own title
  const title = text.match(/<title>([^<]+)<\/title>/)?.[1] ?? (lang === 'en' ? 'Your place is secured' : 'Η θέση σας εξασφαλίστηκε');
  const place = PLACE[row.course] ?? { el: '', en: '' };
  const html = text
    .replaceAll('{{SITE}}', SITE)
    .replaceAll('{{ASSETS}}', ASSETS)
    .replaceAll('{{GREETING}}', lang === 'en' ? `Dear ${name.split(/\s+/)[0] || 'friend'},` : greekGreeting(name))
    .replaceAll('{{COURSE}}', place[lang]);
  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [row.email],
      reply_to: 'philathenea@athenoa.academy',
      subject: `${title} · ${lang === 'en' ? 'ATHENOA' : 'ΑΘΕΝΟΑ'}`,
      html,
    }),
  });
  if (!sent.ok) {
    console.error('resend', sent.status, await sent.text());
    await release();
    return new Response('send failed', { status: 502 });
  }
  return new Response('sent', { status: 200 });
});
