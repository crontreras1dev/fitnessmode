-- fitnessmode initial schema
-- Free trainer directory: public read of active profiles, owner-only writes,
-- no client accounts. Contact details (whatsapp/phone) are only exposed for pro tier.

create extension if not exists unaccent with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.profile_tier as enum ('free', 'pro');
create type public.profile_status as enum ('pending', 'active', 'suspended');
create type public.profile_event_type as enum ('view', 'click');
create type public.profile_click_target as enum ('instagram', 'tiktok', 'website', 'whatsapp', 'phone');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.slugify(value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(extensions.unaccent(value)), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Lookup tables
-- ---------------------------------------------------------------------------
create table public.categories (
  id smallint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text,
  sort_order smallint not null default 0
);

create table public.modalities (
  id smallint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  sort_order smallint not null default 0
);

create table public.specialties (
  id smallint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  sort_order smallint not null default 0
);

create table public.cities (
  id integer generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  region text,
  country_code char(2) not null,
  latitude double precision,
  longitude double precision,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index cities_published_idx on public.cities (is_published) where is_published;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  display_name text not null check (char_length(display_name) between 2 and 80),
  headline text check (char_length(headline) <= 120),
  bio text check (char_length(bio) <= 1500),
  city_id integer not null references public.cities (id),
  avatar_url text,
  instagram_url text,
  tiktok_url text,
  website_url text,
  -- Contact channels: stored for everyone, exposed publicly only for tier = 'pro'
  -- (column SELECT is revoked below; read through get_profile_contact()).
  whatsapp text check (whatsapp ~ '^\+?[0-9]{7,15}$'),
  phone text check (phone ~ '^\+?[0-9 ()-]{7,20}$'),
  rate_min integer check (rate_min >= 0),
  rate_max integer check (rate_max >= 0),
  currency char(3) not null default 'USD',
  tier public.profile_tier not null default 'free',
  status public.profile_status not null default 'pending',
  search tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(display_name, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(headline, '')), 'B')
    || setweight(to_tsvector('simple', coalesce(bio, '')), 'C')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_rate_range check (rate_min is null or rate_max is null or rate_min <= rate_max)
);

create index profiles_search_idx on public.profiles using gin (search);
create index profiles_city_status_idx on public.profiles (city_id, status, tier);
create index profiles_status_idx on public.profiles (status);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Ensures a unique slug: uses the provided slug (or the display name) as base and
-- appends -2, -3, ... when taken. Security definer so it sees non-public rows too.
create or replace function public.ensure_profile_slug()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text;
  candidate text;
  n integer := 1;
begin
  base := public.slugify(coalesce(nullif(new.slug, ''), new.display_name));
  if base is null or base = '' then
    base := 'trainer';
  end if;
  base := left(base, 60);
  candidate := base;
  while exists (select 1 from public.profiles p where p.slug = candidate and p.id <> new.id) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  new.slug := candidate;
  return new;
end;
$$;

create trigger profiles_ensure_slug
  before insert on public.profiles
  for each row execute function public.ensure_profile_slug();

-- ---------------------------------------------------------------------------
-- Join tables
-- ---------------------------------------------------------------------------
create table public.profile_categories (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  category_id smallint not null references public.categories (id) on delete cascade,
  primary key (profile_id, category_id)
);
create index profile_categories_category_idx on public.profile_categories (category_id);

create table public.profile_modalities (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  modality_id smallint not null references public.modalities (id) on delete cascade,
  primary key (profile_id, modality_id)
);
create index profile_modalities_modality_idx on public.profile_modalities (modality_id);

create table public.profile_specialties (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  specialty_id smallint not null references public.specialties (id) on delete cascade,
  primary key (profile_id, specialty_id)
);
create index profile_specialties_specialty_idx on public.profile_specialties (specialty_id);

-- ---------------------------------------------------------------------------
-- Analytics
-- ---------------------------------------------------------------------------
create table public.profile_events (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  event_type public.profile_event_type not null,
  target public.profile_click_target,
  referrer text,
  created_at timestamptz not null default now(),
  constraint profile_events_target_check check (
    (event_type = 'click' and target is not null) or (event_type = 'view' and target is null)
  )
);
create index profile_events_profile_created_idx on public.profile_events (profile_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.modalities enable row level security;
alter table public.specialties enable row level security;
alter table public.cities enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_categories enable row level security;
alter table public.profile_modalities enable row level security;
alter table public.profile_specialties enable row level security;
alter table public.profile_events enable row level security;

create policy "Lookup tables are public" on public.categories for select to anon, authenticated using (true);
create policy "Lookup tables are public" on public.modalities for select to anon, authenticated using (true);
create policy "Lookup tables are public" on public.specialties for select to anon, authenticated using (true);
create policy "Lookup tables are public" on public.cities for select to anon, authenticated using (true);

create policy "Active profiles are public" on public.profiles
  for select to anon, authenticated
  using (status = 'active' or id = (select auth.uid()));

create policy "Owners create their pending free profile" on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()) and status = 'pending' and tier = 'free');

create policy "Owners update their profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Owners delete their profile" on public.profiles
  for delete to authenticated
  using (id = (select auth.uid()));

-- Column-level privileges: contact channels are never directly readable by API roles,
-- and owners cannot change slug / tier / status (moderation + billing own those).
revoke select, insert, update on public.profiles from anon, authenticated;
grant select (
  id, slug, display_name, headline, bio, city_id, avatar_url,
  instagram_url, tiktok_url, website_url, rate_min, rate_max, currency,
  tier, status, search, created_at, updated_at
) on public.profiles to anon, authenticated;
grant insert (
  id, slug, display_name, headline, bio, city_id, avatar_url,
  instagram_url, tiktok_url, website_url, whatsapp, phone, rate_min, rate_max, currency
) on public.profiles to authenticated;
grant update (
  display_name, headline, bio, city_id, avatar_url,
  instagram_url, tiktok_url, website_url, whatsapp, phone, rate_min, rate_max, currency
) on public.profiles to authenticated;

-- Join tables: readable when the profile is readable, writable by the owner.
create policy "Profile taxonomy is public for visible profiles" on public.profile_categories
  for select to anon, authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id));
create policy "Owners manage profile taxonomy" on public.profile_categories
  for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy "Profile taxonomy is public for visible profiles" on public.profile_modalities
  for select to anon, authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id));
create policy "Owners manage profile taxonomy" on public.profile_modalities
  for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy "Profile taxonomy is public for visible profiles" on public.profile_specialties
  for select to anon, authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id));
create policy "Owners manage profile taxonomy" on public.profile_specialties
  for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- Events are written server-side with the service role (no insert policy for API roles);
-- owners can read their own events.
create policy "Owners read their events" on public.profile_events
  for select to authenticated
  using (profile_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

-- Contact channels for a profile: only for active pro profiles, or the owner.
create or replace function public.get_profile_contact(p_profile_id uuid)
returns table (whatsapp text, phone text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.whatsapp, p.phone
  from public.profiles p
  where p.id = p_profile_id
    and ((p.tier = 'pro' and p.status = 'active') or p.id = (select auth.uid()));
$$;

-- Daily views / outbound clicks for the signed-in owner.
create or replace function public.get_profile_stats(p_days integer default 30)
returns table (day date, views bigint, clicks bigint)
language sql
stable
set search_path = ''
as $$
  with days as (
    select generate_series(current_date - (greatest(p_days, 1) - 1), current_date, interval '1 day')::date as day
  )
  select
    d.day,
    count(e.id) filter (where e.event_type = 'view') as views,
    count(e.id) filter (where e.event_type = 'click') as clicks
  from days d
  left join public.profile_events e
    on e.profile_id = (select auth.uid())
   and e.created_at >= d.day
   and e.created_at < d.day + 1
  group by d.day
  order by d.day;
$$;

-- Outbound clicks per target for the signed-in owner.
create or replace function public.get_profile_click_breakdown(p_days integer default 30)
returns table (target public.profile_click_target, clicks bigint)
language sql
stable
set search_path = ''
as $$
  select e.target, count(*) as clicks
  from public.profile_events e
  where e.profile_id = (select auth.uid())
    and e.event_type = 'click'
    and e.created_at >= current_date - (greatest(p_days, 1) - 1)
  group by e.target
  order by clicks desc;
$$;

revoke execute on function public.get_profile_stats(integer) from anon;
revoke execute on function public.get_profile_click_breakdown(integer) from anon;

-- Directory search: returns a page of matching active profile ids (pro tier first)
-- plus the total match count. Security invoker, so RLS still applies.
create or replace function public.search_profiles(
  p_city text default null,
  p_category text default null,
  p_modality text default null,
  p_specialty text default null,
  p_rate_min integer default null,
  p_rate_max integer default null,
  p_query text default null,
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (id uuid, total_count bigint)
language sql
stable
set search_path = ''
as $$
  select p.id, count(*) over () as total_count
  from public.profiles p
  join public.cities c on c.id = p.city_id
  where p.status = 'active'
    and (p_city is null or c.slug = p_city)
    and (p_category is null or exists (
      select 1 from public.profile_categories pc
      join public.categories x on x.id = pc.category_id
      where pc.profile_id = p.id and x.slug = p_category))
    and (p_modality is null or exists (
      select 1 from public.profile_modalities pm
      join public.modalities x on x.id = pm.modality_id
      where pm.profile_id = p.id and x.slug = p_modality))
    and (p_specialty is null or exists (
      select 1 from public.profile_specialties ps
      join public.specialties x on x.id = ps.specialty_id
      where ps.profile_id = p.id and x.slug = p_specialty))
    and (p_rate_min is null or coalesce(p.rate_max, p.rate_min) >= p_rate_min)
    and (p_rate_max is null or coalesce(p.rate_min, p.rate_max) <= p_rate_max)
    and (p_query is null or p.search @@ websearch_to_tsquery('simple', p_query))
  order by
    (p.tier = 'pro') desc,
    case when p_query is null then 0 else ts_rank(p.search, websearch_to_tsquery('simple', p_query)) end desc,
    p.created_at desc
  limit least(greatest(p_limit, 1), 50)
  offset greatest(p_offset, 0);
$$;
