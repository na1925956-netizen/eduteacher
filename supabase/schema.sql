-- =====================================================================
-- EduTeacher — Supabase schema (tables, RLS, Storage)
-- Run once in Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run: every statement is idempotent.
-- =====================================================================

-- ---------- 1. Admins ----------------------------------------------------
-- Only users listed here can publish. Add yourself after creating the user
-- (see the end of this file).
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "admins: read own row" on public.admins;
create policy "admins: read own row" on public.admins
  for select to authenticated
  using (user_id = auth.uid());
-- No insert/update/delete policies: the admin list can only be changed from the dashboard.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- 2. Materials -------------------------------------------------
create table if not exists public.materials (
  id           uuid primary key default gen_random_uuid(),
  section      text not null check (section in ('national','comics','feedback','games','materials','assessment')),
  title        text not null check (char_length(title) between 1 and 200),
  description  text not null default '' check (char_length(description) <= 2000),
  grade        smallint check (grade between 1 and 11),
  subject      text check (char_length(subject) <= 100),
  category     text check (char_length(category) <= 100),
  term         smallint check (term between 1 and 4),
  kind         text not null check (kind in ('files','link','html')),
  link_url     text check (link_url is null or link_url ~* '^https?://'),
  embeddable   boolean not null default false,
  cover_path   text,
  -- [{ "path": "<uuid>/<uuid>.pdf", "name": "Original name.pdf", "ext": "pdf", "size": 12345 }]
  files        jsonb not null default '[]'::jsonb check (jsonb_typeof(files) = 'array'),
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists materials_section_created_idx on public.materials (section, created_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists materials_touch on public.materials;
create trigger materials_touch before update on public.materials
  for each row execute function public.touch_updated_at();

alter table public.materials enable row level security;

drop policy if exists "materials: public read" on public.materials;
create policy "materials: public read" on public.materials
  for select to anon, authenticated
  using (published or public.is_admin());

drop policy if exists "materials: admin insert" on public.materials;
create policy "materials: admin insert" on public.materials
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "materials: admin update" on public.materials;
create policy "materials: admin update" on public.materials
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "materials: admin delete" on public.materials;
create policy "materials: admin delete" on public.materials
  for delete to authenticated
  using (public.is_admin());

-- ---------- 2b. API privileges -------------------------------------------
-- New Supabase projects no longer expose tables to the API roles automatically.
-- These grants only open the door; the RLS policies above still decide who may do what.
grant usage on schema public to anon, authenticated;
grant select on public.materials to anon, authenticated;
grant insert, update, delete on public.materials to authenticated;
grant select on public.admins to authenticated;

-- ---------- 3. Storage bucket -------------------------------------------
-- Public bucket: anyone can download, only admins can upload/change/delete.
-- 50 MB per file is the Free-plan maximum; raise it on a paid plan if needed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'materials', 'materials', true, 52428800,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg', 'image/png', 'image/webp',
    'text/html'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage needs SELECT on objects for remove()/update to find the files (downloads of a public
-- bucket don't use this policy, so it only matters for the admin).
drop policy if exists "materials bucket: admin select" on storage.objects;
create policy "materials bucket: admin select" on storage.objects
  for select to authenticated
  using (bucket_id = 'materials' and public.is_admin());

drop policy if exists "materials bucket: admin insert" on storage.objects;
create policy "materials bucket: admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'materials' and public.is_admin());

drop policy if exists "materials bucket: admin update" on storage.objects;
create policy "materials bucket: admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'materials' and public.is_admin())
  with check (bucket_id = 'materials' and public.is_admin());

drop policy if exists "materials bucket: admin delete" on storage.objects;
create policy "materials bucket: admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'materials' and public.is_admin());

-- ---------- 4. Make yourself the admin ----------------------------------
-- 1) Dashboard → Authentication → Users → Add user → Create new user
--    (your email + a strong password, tick "Auto Confirm User").
-- 2) Replace the email below and run:
--
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'YOUR_EMAIL@example.com'
-- on conflict do nothing;
