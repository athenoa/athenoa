// Stripe tells us how each payment went (Maria, 23 November 2026). Every registration is saved before the
// visitor goes to Stripe (payment_status 'pending'); its id travels to Stripe as client_reference_id and comes
// back here, so the row is marked paid, failed or abandoned. Only events signed with STRIPE_WEBHOOK_SECRET
// (set in the Supabase dashboard; never in the code) are believed. No Stripe API key is used. Marking a
// registration paid sets off its confirmation email (trigger registrations_confirm_paid).
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
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

// Stripe's time: seconds in a classic ("snapshot") event, an ISO string in a thin one. Never throws.
function when(created: unknown): string | null {
  const d =
    typeof created === 'number' ? new Date(created * 1000)
    : typeof created === 'string' ? new Date(/^\d+$/.test(created) ? Number(created) * 1000 : created)
    : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString() : null;
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
  const s = event.data?.object ?? {};
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const id = String(s.client_reference_id ?? '');
  const isRegistration = /^[0-9a-f-]{36}$/i.test(id);
  // Every signed event is kept in stripe_events, with who paid and how much where Stripe says (Maria, 24 November
  // 2026), so a payment that matches no registration is never lost. A failure to log never stops the webhook.
  // A thin event (Stripe destination set to the "thin" payload, 25 November 2026) carries no data.object, only
  // the id of what changed (related_object): it is kept with that id and answered 200, so Stripe stops retrying.
  const thin = !event.data?.object;
  const related = (event.related_object ?? {}) as Record<string, unknown>;
  const log = async (outcome: string) => {
    try {
      const who = (s.customer_details ?? {}) as Record<string, unknown>;
      const isSession = s.object === 'checkout.session';
      const { error: logError } = await db.from('stripe_events').upsert(
        {
          id: String(event.id ?? crypto.randomUUID()),
          type: String(event.type ?? ''),
          stripe_created: when(event.created),
          session_id: isSession ? (s.id ?? null) : thin && typeof related.id === 'string' ? related.id : null,
          client_reference_id: s.client_reference_id ?? null,
          payment_link: s.payment_link ?? null,
          mode: s.mode ?? null,
          payment_status: s.payment_status ?? s.status ?? null,
          amount: typeof s.amount_total === 'number' ? s.amount_total / 100 : typeof s.amount === 'number' ? s.amount / 100 : null,
          currency: s.currency ?? null,
          email: who.email ?? s.receipt_email ?? s.customer_email ?? null,
          name: who.name ?? null,
          phone: who.phone ?? null,
          matched_registration: ['paid', 'failed', 'abandoned'].includes(outcome) ? id : null,
          outcome,
        },
        { onConflict: 'id', ignoreDuplicates: true },
      );
      if (logError) console.error('log', logError.message);
    } catch (e) {
      // logging never turns into a failed answer
      console.error('log', String(e));
    }
  };

  if (thin) {
    await log('thin event, ignored');
    return new Response('thin event, ignored', { status: 200 });
  }

  const decide = STATUS[event.type];
  if (!decide) {
    await log('ignored');
    return new Response('ignored', { status: 200 });
  }
  if (!isRegistration) {
    await log('no registration');
    return new Response('no registration', { status: 200 });
  }
  const status = decide(s);
  if (!status) {
    await log('waiting');
    return new Response('waiting', { status: 200 });
  }
  const update: Record<string, unknown> = {
    payment_status: status,
    stripe_session_id: s.id ?? null,
    stripe_customer_email: (s.customer_details as Record<string, unknown> | undefined)?.email ?? null,
    payment_updated_at: new Date().toISOString(),
  };
  if (status === 'paid') {
    update.paid_at = when(event.created) ?? new Date().toISOString();
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
    await log('update failed');
    return new Response('update failed', { status: 500 });
  }
  await log(before ? status : 'registration not found');
  // The "registration complete" email is sent by the database trigger registrations_confirm_paid (function
  // registration-confirmed), for card and bank-transfer payments alike (Maria, 26 November 2026).
  return new Response('ok', { status: 200 });
});
