-- Applied 26 November 2026: a sign-up from the site (anon, or a signed-in non-admin) can never arrive already
-- paid or already emailed; the payment fields are set only by Stripe (service role) or by an admin.
create or replace function public.registrations_guard_insert()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
declare
  guard boolean := false;
begin
  if current_user = 'anon' then
    guard := true;
  elsif current_user = 'authenticated' then
    guard := not coalesce(public.is_admin(), false);
  end if;
  if guard then
    new.payment_status := 'pending';
    new.paid_at := null;
    new.amount_paid := null;
    new.currency := null;
    new.stripe_session_id := null;
    new.stripe_customer_email := null;
    new.payment_updated_at := null;
    new.confirmation_sent_at := null;
  end if;
  return new;
end $function$;

create trigger registrations_guard_insert
before insert on public.registrations
for each row execute function public.registrations_guard_insert();
