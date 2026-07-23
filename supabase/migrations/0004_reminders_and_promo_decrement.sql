-- supabase/migrations/0004_reminders_and_promo_decrement.sql

alter table public.bookings add column if not exists reminder_sent_at timestamptz;

create index if not exists idx_bookings_reminder_pending
  on public.bookings(status, reminder_sent_at, session_start);

create index if not exists idx_bookings_pending_created
  on public.bookings(status, created_at);

-- Nécessaire pour libérer l'usage d'un code promo (percentage/fixed) quand une
-- réservation 'pending' expire sans paiement — sinon le compteur reste faussé.
create or replace function decrement_promo_usage(promo_id uuid)
returns void as $$
begin
  update public.promo_codes
  set times_used = greatest(times_used - 1, 0)
  where id = promo_id;
end;
$$ language plpgsql security definer;