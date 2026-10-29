-- 0005: dashboard-only profile details — languages, education, session types,
-- amenities and a photo gallery. None of these are part of the signup wizard;
-- trainers fill them in after their profile exists.

-- ---------------------------------------------------------------------------
-- Profile columns
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column languages text[] not null default '{}',
  add column education jsonb not null default '[]'::jsonb;

alter table public.profiles add constraint profiles_languages_check
  check (cardinality(languages) <= 10);

alter table public.profiles add constraint profiles_education_check check (
  jsonb_typeof(education) = 'array' and jsonb_array_length(education) <= 12
);

-- The profiles column grants from 0001 are column-level, so new columns must be
-- granted explicitly.
grant select (languages, education) on public.profiles to anon, authenticated;
grant insert (languages, education) on public.profiles to authenticated;
grant update (languages, education) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Lookup tables
-- ---------------------------------------------------------------------------
create table public.session_types (
  id smallint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  sort_order smallint not null default 0
);

create table public.amenities (
  id smallint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  sort_order smallint not null default 0
);

-- ---------------------------------------------------------------------------
-- Join tables
-- ---------------------------------------------------------------------------
create table public.profile_session_types (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  session_type_id smallint not null references public.session_types (id) on delete cascade,
  primary key (profile_id, session_type_id)
);
create index profile_session_types_type_idx
  on public.profile_session_types (session_type_id);

create table public.profile_amenities (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  amenity_id smallint not null references public.amenities (id) on delete cascade,
  primary key (profile_id, amenity_id)
);
create index profile_amenities_amenity_idx on public.profile_amenities (amenity_id);

-- ---------------------------------------------------------------------------
-- Photo gallery
-- ---------------------------------------------------------------------------
-- path is the object name inside the 'gallery' storage bucket ({uid}/{file}).
create table public.profile_photos (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  path text not null unique,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);
create index profile_photos_profile_idx
  on public.profile_photos (profile_id, sort_order, id);

-- Hard cap so a gallery can't grow unbounded (the app also checks, this is the
-- backstop).
create or replace function public.enforce_photo_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.profile_photos where profile_id = new.profile_id) >= 8 then
    raise exception 'A profile can have at most 8 gallery photos';
  end if;
  return new;
end;
$$;

create trigger profile_photos_limit
  before insert on public.profile_photos
  for each row execute function public.enforce_photo_limit();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.session_types enable row level security;
alter table public.amenities enable row level security;
alter table public.profile_session_types enable row level security;
alter table public.profile_amenities enable row level security;
alter table public.profile_photos enable row level security;

create policy "Lookup tables are public" on public.session_types
  for select to anon, authenticated using (true);
create policy "Lookup tables are public" on public.amenities
  for select to anon, authenticated using (true);

create policy "Profile taxonomy is public for visible profiles" on public.profile_session_types
  for select to anon, authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id));
create policy "Owners manage profile taxonomy" on public.profile_session_types
  for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy "Profile taxonomy is public for visible profiles" on public.profile_amenities
  for select to anon, authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id));
create policy "Owners manage profile taxonomy" on public.profile_amenities
  for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy "Gallery photos are public for visible profiles" on public.profile_photos
  for select to anon, authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id));
create policy "Owners manage their gallery" on public.profile_photos
  for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Gallery storage policies (mirrors the avatars bucket)
-- ---------------------------------------------------------------------------
create policy "Gallery images are public"
on storage.objects for select
to public
using (bucket_id = 'gallery');

create policy "Owners upload gallery images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'gallery'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Owners replace gallery images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'gallery'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'gallery'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Owners delete gallery images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'gallery'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
