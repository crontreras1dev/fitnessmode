-- Allow trainers outside the listed cities: city_id becomes optional and a
-- free-text custom_location fills the gap. Exactly one must be set.

alter table public.profiles alter column city_id drop not null;
alter table public.profiles
  add column custom_location text check (char_length(custom_location) <= 120);
alter table public.profiles
  add constraint profiles_location_required
  check (city_id is not null or nullif(custom_location, '') is not null);

-- Column-level privileges are explicit, so grant the new column too.
grant select (custom_location) on public.profiles to anon, authenticated;
grant insert (custom_location) on public.profiles to authenticated;
grant update (custom_location) on public.profiles to authenticated;

-- Free-text trainers have no city row, so search must left join to keep them
-- in unfiltered results. City filters still exclude them (no matching slug).
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
  left join public.cities c on c.id = p.city_id
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
