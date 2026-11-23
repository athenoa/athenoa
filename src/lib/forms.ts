// Where the site's forms are kept (Maria, 22 November 2026): a Supabase project of our own, "athenoa"
// (ref czfcjxzngedjjskybvos, Frankfurt), until the Academy's own systems are tidied. Two tables, waitlist
// and registrations; the rows are read in the Supabase dashboard.
// The key below is the project's PUBLISHABLE key, made to be shipped in a web page: the database lets it
// add rows to those two tables and nothing else (no reading, changing or deleting; see the policies there).
const URL = 'https://czfcjxzngedjjskybvos.supabase.co/rest/v1';
const KEY = 'sb_publishable_UsD5ub8WtH_XAnwxU0OrtA_HIjD5H2C';

export type Table = 'waitlist' | 'registrations' | 'newsletter';

/** Adds one row. Resolves when it is stored; rejects with the server's message otherwise. */
export async function addRow(table: Table, row: Record<string, unknown>): Promise<void> {
  const response = await fetch(`${URL}/${table}`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
  // 409: the address is already on the list (newsletter), which is as good as a new sign-up
  if (!response.ok && response.status !== 409) throw new Error(`${response.status} ${await response.text()}`);
}
