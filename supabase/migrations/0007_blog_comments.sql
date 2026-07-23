-- supabase/migrations/0007_blog_comments.sql

create table public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  author_name text not null,
  author_email text not null,
  body text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.blog_comments enable row level security;

create policy "comments_public_read_approved" on public.blog_comments
  for select using (is_approved = true);

create policy "comments_public_insert" on public.blog_comments
  for insert with check (
    char_length(author_name) between 1 and 100
    and char_length(author_email) between 3 and 255
    and char_length(body) between 1 and 2000
    and is_approved = false
  );

create policy "comments_admin_all" on public.blog_comments
  for all using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create index idx_blog_comments_post on public.blog_comments(post_id, is_approved, created_at);