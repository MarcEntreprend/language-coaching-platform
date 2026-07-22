-- supabase/migrations/0001_init_schema.sql

-- ============ PROFILES (extends auth.users) ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  timezone text not null default 'UTC',
  english_level text check (english_level in ('A1','A2','B1','B2','C1','C2')),
  learning_goals text,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- ============ COACH AVAILABILITY (recurring weekly slots) ============
create table public.coach_availability (
  id uuid primary key default gen_random_uuid(),
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0=dimanche
  start_time time not null,
  end_time time not null,
  timezone text not null default 'UTC',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.coach_availability enable row level security;

create policy "availability_public_read" on public.coach_availability
  for select using (is_active = true);

create policy "availability_admin_write" on public.coach_availability
  for all using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- ============ BOOKINGS ============
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  session_start timestamptz not null,
  session_end timestamptz not null,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed','no_show')),
  promo_code_id uuid references public.promo_codes(id),
  price_paid_cents integer not null default 0,
  currency text not null default 'USD',
  session_notes text, -- private, coach only
  student_rating smallint check (student_rating between 1 and 5),
  student_feedback text,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy "bookings_student_select" on public.bookings
  for select using (
    auth.uid() = student_id or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "bookings_student_insert" on public.bookings
  for insert with check (auth.uid() = student_id);

create policy "bookings_student_update_own" on public.bookings
  for update using (auth.uid() = student_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Note : session_notes doit être filtré côté application (jamais renvoyé au student
-- dans les requêtes SELECT ciblant le student) même si RLS autorise la lecture de la ligne.
-- Recommandation Phase 2 : créer une VIEW bookings_student_view qui exclut session_notes.

-- ============ PAYMENTS / INVOICES ============
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  stripe_payment_intent_id text unique,
  amount_cents integer not null,
  currency text not null default 'USD',
  status text not null check (status in ('pending','succeeded','failed','refunded')),
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "payments_admin_only" on public.payments
  for all using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "payments_student_select_own" on public.payments
  for select using (exists (
    select 1 from public.bookings b where b.id = booking_id and b.student_id = auth.uid()
  ));

-- ============ PROMO CODES ============
create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage','fixed','free')),
  discount_value numeric not null default 0, -- ignoré si 'free'
  max_uses integer,
  times_used integer not null default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.promo_codes enable row level security;

create policy "promo_admin_all" on public.promo_codes
  for all using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "promo_public_validate" on public.promo_codes
  for select using (is_active = true);

-- ============ MESSAGES ============
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "messages_participants_only" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "messages_insert_as_sender" on public.messages
  for insert with check (auth.uid() = sender_id);

-- ============ BLOG ============
create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

alter table public.blog_categories enable row level security;
create policy "blog_categories_public_read" on public.blog_categories for select using (true);
create policy "blog_categories_admin_write" on public.blog_categories
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.blog_categories(id),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  cover_image_url text,
  meta_title text,
  meta_description text,
  og_image_url text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;
create policy "blog_posts_public_read" on public.blog_posts for select using (is_published = true);
create policy "blog_posts_admin_all" on public.blog_posts
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============ PROGRESS LOGS ============
create table public.progress_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

alter table public.progress_logs enable row level security;
create policy "progress_admin_all" on public.progress_logs
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "progress_student_read_own" on public.progress_logs
  for select using (auth.uid() = student_id);

-- ============ INDEXES ============
create index idx_bookings_student on public.bookings(student_id);
create index idx_bookings_session_start on public.bookings(session_start);
create index idx_messages_recipient on public.messages(recipient_id, is_read);
create index idx_blog_posts_published on public.blog_posts(is_published, published_at desc);
create index idx_payments_booking on public.payments(booking_id);



--


-- // app/api/bookings/route.ts
-- Note importante : la ligne await supabase.rpc('increment_promo_usage', ...) appelle une fonction Postgres qu'il faut créer pour éviter une race condition (deux users utilisant le même code en même temps) :


-- supabase/migrations/0002_promo_increment_fn.sql
create or replace function increment_promo_usage(promo_id uuid)
returns void as $$
begin
  update public.promo_codes
  set times_used = times_used + 1
  where id = promo_id;
end;
$$ language plpgsql security definer;