-- 0006: dedup profile_events so /api/track/* can't be spammed to inflate stats.
-- Events now carry a salted hash of the client IP; record_profile_event()
-- refuses to insert a repeat (profile, type, target, IP) inside a 30-minute
-- window, and the stats RPCs count unique IPs instead of raw rows.

alter table public.profile_events add column ip_hash text;

create index profile_events_dedup_idx
  on public.profile_events (profile_id, event_type, ip_hash, created_at desc);

-- ---------------------------------------------------------------------------
-- Event ingest with dedup
-- ---------------------------------------------------------------------------
-- Inserts an event unless the same profile/type/target/IP already recorded one
-- within the window. Returns the new row id, or null when skipped. The
-- advisory lock serializes concurrent bursts from the same IP so the
-- check-then-insert can't race.
create or replace function public.record_profile_event(
  p_profile_id uuid,
  p_event_type public.profile_event_type,
  p_target public.profile_click_target default null,
  p_referrer text default null,
  p_ip_hash text default null,
  p_dedup_minutes integer default 30
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id bigint;
begin
  if p_ip_hash is not null then
    perform pg_advisory_xact_lock(hashtextextended(p_profile_id::text || p_ip_hash, 0));

    if exists (
      select 1
      from public.profile_events e
      where e.profile_id = p_profile_id
        and e.event_type = p_event_type
        and e.target is not distinct from p_target
        and e.ip_hash = p_ip_hash
        and e.created_at > now() - make_interval(mins => greatest(p_dedup_minutes, 0))
    ) then
      return null;
    end if;
  end if;

  insert into public.profile_events (profile_id, event_type, target, referrer, ip_hash)
  values (p_profile_id, p_event_type, p_target, p_referrer, p_ip_hash)
  returning id into v_id;

  return v_id;
end;
$$;

-- Events are written only through the service role (the /api/track/* handler).
-- PUBLIC must be revoked too — API roles inherit EXECUTE through it, and a
-- callable RPC would let callers pass p_ip_hash=null / p_dedup_minutes=0 to
-- bypass dedup entirely.
revoke execute on function public.record_profile_event(
  uuid, public.profile_event_type, public.profile_click_target, text, text, integer
) from public, anon, authenticated;
grant execute on function public.record_profile_event(
  uuid, public.profile_event_type, public.profile_click_target, text, text, integer
) to service_role;

-- ---------------------------------------------------------------------------
-- Stats: count unique IPs, not raw rows
-- ---------------------------------------------------------------------------
-- Rows written before this migration have NULL ip_hash; coalesce to the row id
-- so each legacy row still counts once instead of collapsing into a single
-- "unknown" visitor.
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
    count(distinct coalesce(e.ip_hash, e.id::text)) filter (where e.event_type = 'view') as views,
    count(distinct coalesce(e.ip_hash, e.id::text)) filter (where e.event_type = 'click') as clicks
  from days d
  left join public.profile_events e
    on e.profile_id = (select auth.uid())
   and e.created_at >= d.day
   and e.created_at < d.day + 1
  group by d.day
  order by d.day;
$$;

create or replace function public.get_profile_click_breakdown(p_days integer default 30)
returns table (target public.profile_click_target, clicks bigint)
language sql
stable
set search_path = ''
as $$
  select e.target, count(distinct coalesce(e.ip_hash, e.id::text)) as clicks
  from public.profile_events e
  where e.profile_id = (select auth.uid())
    and e.event_type = 'click'
    and e.created_at >= current_date - (greatest(p_days, 1) - 1)
  group by e.target
  order by clicks desc;
$$;
