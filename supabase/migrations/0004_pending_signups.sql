-- Reliable handoff for wizard answers during email signup.
-- signInWithOtp's `data` option only lands in user_metadata when it creates a
-- NEW auth user; for an email that already exists in auth.users it is silently
-- ignored, so the profile was never created after the magic-link round trip.
-- This table stores the pending profile server-side, keyed by email.
--
-- Only the service role reads/writes it (RLS enabled, no policies, no grants).

create table public.pending_signups (
  email text primary key,
  profile jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.pending_signups enable row level security;

revoke all on public.pending_signups from anon, authenticated;
