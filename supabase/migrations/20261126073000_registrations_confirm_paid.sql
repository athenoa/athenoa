-- Applied 26 November 2026 (Maria): one "registration complete" email per registration, whether paid by card
-- (Stripe) or marked paid by bank transfer in the dashboard. The trigger calls the registration-confirmed function.
alter table public.registrations add column if not exists confirmation_sent_at timestamptz;
update public.registrations set confirmation_sent_at = coalesce(paid_at, payment_updated_at, now())
where payment_status = 'paid' and confirmation_sent_at is null;

-- registrations_send_confirmation(): net.http_post to functions/v1/registration-confirmed with { id }, using the
-- public anon key (same pattern as newsletter_send_welcome); see the database for the exact body.
create trigger registrations_confirm_paid
after update of payment_status on public.registrations
for each row
when (old.payment_status is distinct from new.payment_status and new.payment_status = 'paid' and new.confirmation_sent_at is null)
execute function public.registrations_send_confirmation();
