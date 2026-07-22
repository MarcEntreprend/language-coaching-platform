-- supabase/migrations/0003_store_settings.sql

create table public.store_settings (
  id smallint primary key default 1,
  base_session_price_cents integer not null default 3000,
  currency text not null default 'USD',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

alter table public.store_settings enable row level security;

create policy "store_settings_public_read" on public.store_settings
  for select using (true);

create policy "store_settings_admin_write" on public.store_settings
  for all using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

insert into public.store_settings (id, base_session_price_cents, currency)
values (1, 3000, 'USD')
on conflict (id) do nothing;