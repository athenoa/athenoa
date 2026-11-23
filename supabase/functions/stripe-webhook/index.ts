// Stripe tells us how each payment went (Maria, 23 November 2026). Every registration is saved before the
// visitor goes to Stripe (payment_status 'pending'); its id travels to Stripe as client_reference_id and comes
// back here, so the row is marked paid, failed or abandoned. Only events signed with STRIPE_WEBHOOK_SECRET
// (set in the Supabase dashboard; never in the code) are believed. No Stripe API key is used. The first time a
// registration is paid, it sends the "your place is secured" email (public/email/payment-confirmed.<lang>.html).
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
const SITE = Deno.env.get('SITE_URL') ?? 'https://www.athenoa.academy';
const ASSETS = Deno.env.get('ASSETS_URL') ?? `${SITE}/email`;
const FROM = Deno.env.get('EMAIL_FROM') ?? 'ATHENOA <onboarding@resend.dev>';

// What they paid for, as the email's sentence needs it ("η θέση σας … εξασφαλίστηκε"), and its page
const PLACE: Record<string, { el: string; en: string; path: string }> = {
  odusseia: { el: 'στον Κύκλο Σπουδών «Οδύσσεια»', en: 'in the Cycle of Studies “Odyssey”', path: '/courses/odusseia/' },
  'eu-zen': { el: 'στον Κύκλο Σπουδών «Εὖ Ζῆν»', en: 'in the Cycle of Studies “Eu Zen”', path: '/courses/eu-zen/' },
  membership: { el: 'ως Μέλος της Ακαδημίας', en: 'as a Member of the Academy', path: '/membership/' },
};

// "Αγαπητή Μαρία," / "Αγαπητέ Γιώργο,": the greeting in Greek follows the first name (Maria, 23 November 2026).
// Greek men's names end in ς and take the vocative (-ος → -ο or -ε, -ας → -α, -ης → -η); other Greek names
// are taken as women's. A name not in Greek letters, or none, gets "Αγαπητή/έ".
const vowels = (w: string) => (w.normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[αεηιουω]+/gi) ?? []).length;
function greekGreeting(raw: string) {
  const name = raw.trim().split(/\s+/)[0] ?? '';
  if (!name) return 'Αγαπητή/έ φίλη/ε,';
  if (!/^[\u0370-\u03ff\u1f00-\u1fff]+$/.test(name)) return `Αγαπητή/έ ${name},`;
  const cap = name[0].toUpperCase() + name.slice(1);
  if (/ς$/.test(cap)) {
    let voc = cap;
    if (/ος$/.test(cap)) voc = vowels(cap) <= 2 ? cap.slice(0, -1) : cap.slice(0, -2) + 'ε';
    else voc = cap.slice(0, -1);
    return `Αγαπητέ ${voc},`;
  }
  return `Αγαπητή ${cap},`;
}

// "Your place is secured": sent once, when a registration first becomes paid
async function confirm(row: { email: string; first_name: string | null; course: string; locale: string | null }) {
  const lang = row.locale === 'en' ? 'en' : 'el';
  const place = PLACE[row.course] ?? { el: '', en: '', path: '/' };
  const page = await fetch(`${ASSETS}/payment-confirmed.${lang}.html`);
  if (!page.ok) return console.error('template', page.status);
  const name = (row.first_name ?? '').trim();
  const html = (await page.text())
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
      subject: lang === 'en' ? 'Your place is secured · ATHENOA' : 'Η θέση σας εξασφαλίστηκε · ΑΘΕΝΟΑ',
      html,
    }),
  });
  if (!sent.ok) console.error('resend', sent.status, await sent.text());
}
const TOLERANCE = 5 * 60; // seconds: older signed messages are refused (replays)

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const same = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

// Stripe-Signature: t=<time>,v1=<hmac of "time.body">[,v1=...]
async function verified(body: string, header: string | null) {
  if (!SECRET || !header) return false;
  const parts = header.split(',').map((p) => p.split('='));
  const t = parts.find(([k]) => k === 't')?.[1];
  const sigs = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - Number(t)) > TOLERANCE) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${body}`)));
  return sigs.some((s) => same(s, expected));
}

const STATUS: Record<string, (s: Record<string, unknown>) => string | null> = {
  // a card payment is paid at once; a bank debit may still be on its way ('unpaid' until the async event)
  'checkout.session.completed': (s) => (s.payment_status === 'paid' || s.payment_status === 'no_payment_required' ? 'paid' : null),
  'checkout.session.async_payment_succeeded': () => 'paid',
  'checkout.session.async_payment_failed': () => 'failed',
  'checkout.session.expired': () => 'abandoned',
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });
  const body = await req.text();
  if (!(await verified(body, req.headers.get('stripe-signature')))) return new Response('bad signature', { status: 400 });

  const event = JSON.parse(body);
  const decide = STATUS[event.type];
  if (!decide) return new Response('ignored', { status: 200 });
  const s = event.data?.object ?? {};
  const id = String(s.client_reference_id ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response('no registration', { status: 200 });
  const status = decide(s);
  if (!status) return new Response('waiting', { status: 200 });

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const update: Record<string, unknown> = {
    payment_status: status,
    stripe_session_id: s.id ?? null,
    stripe_customer_email: (s.customer_details as Record<string, unknown> | undefined)?.email ?? null,
    payment_updated_at: new Date().toISOString(),
  };
  if (status === 'paid') {
    update.paid_at = new Date((Number(event.created) || Date.now() / 1000) * 1000).toISOString();
    update.amount_paid = typeof s.amount_total === 'number' ? s.amount_total / 100 : null;
    update.currency = s.currency ?? null;
  }
  const { data: before } = await db
    .from('registrations')
    .select('email, first_name, course, locale, payment_status')
    .eq('id', id)
    .maybeSingle();
  let q = db.from('registrations').update(update).eq('id', id);
  // a late 'expired' never undoes a payment already recorded
  if (status !== 'paid') q = q.neq('payment_status', 'paid');
  const { error } = await q;
  if (error) {
    console.error('update', error.message);
    return new Response('update failed', { status: 500 });
  }
  // the first time it is paid: the "your place is secured" email
  if (status === 'paid' && before && before.payment_status !== 'paid' && before.email) await confirm(before);
  return new Response('ok', { status: 200 });
});
