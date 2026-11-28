// Unsubscribe link in the newsletter emails: ?id=<the sign-up's id> marks the address as unsubscribed and
// answers with a short page in the site's look (Maria, 23 November 2026).
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const page = (title: string, text: string) =>
  new Response(
    `<!doctype html><html lang="el"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>` +
      `<body style="margin:0;background:#f2e9d3;font-family:'EB Garamond',Garamond,Georgia,serif;color:#071260;">` +
      `<div style="max-width:520px;margin:12vh auto;padding:40px 32px;background:#f9f3e3;border-radius:24px;text-align:center;">` +
      `<p style="letter-spacing:4px;color:#0b1c8c;margin:0 0 18px;">ATHENOA</p><h1 style="font-weight:400;color:#0b1c8c;margin:0 0 12px;">${title}</h1>` +
      `<p style="font-size:18px;line-height:1.5;margin:0 0 22px;">${text}</p><a href="https://www.athenoa.academy" style="color:#0b1c8c;">athenoa.academy</a></div></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );

Deno.serve(async (req) => {
  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!/^[0-9a-f-]{36}$/i.test(id)) return page('Κάτι δεν πήγε καλά', 'Ο σύνδεσμος δεν είναι σωστός.');
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  await db.from('newsletter').update({ unsubscribed_at: new Date().toISOString() }).eq('id', id).is('unsubscribed_at', null);
  return page('Διαγραφήκατε από την λίστα', 'Δεν θα λαμβάνετε πλέον το ενημερωτικό μας δελτίο. Σας ευχαριστούμε που ήσασταν μαζί μας.');
});
