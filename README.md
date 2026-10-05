# FitnessMode

Free trainer directory. Clients browse without an account; trainers get a free profile with
social links (Instagram / TikTok / website). WhatsApp and phone CTAs are reserved for the Pro tier.
City landing pages (`/trainers/[city]`) are generated programmatically for local SEO.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Auth, RLS)

## Getting started

Requires Node 20+ and Docker (for the local Supabase stack).

```bash
npm install
npm run db:start            # starts local Supabase, applies migrations + seed
cp .env.example .env.local  # fill in the keys printed by `npx supabase status`
npm run dev
```

Magic-link emails are captured locally by Mailpit at http://127.0.0.1:54324.

## Scripts

| Script                 | Purpose                                                |
| ---------------------- | ------------------------------------------------------ |
| `npm run dev`          | Next.js dev server                                     |
| `npm run build`        | Production build                                       |
| `npm run lint`         | ESLint                                                 |
| `npm run typecheck`    | `tsc --noEmit`                                         |
| `npm run format:check` | Prettier check                                         |
| `npm run db:reset`     | Re-apply `supabase/migrations` and `supabase/seed.sql` |
| `npm run db:types`     | Regenerate `src/lib/db/types.ts` from the local DB     |

## Layout

```
src/app/(public)      /, /trainers/[city], /trainers/[city]/[slug], /search, sitemap.ts
src/app/(auth)        /signup (3-step wizard), /login, /auth/callback, /auth/signout
src/app/(dashboard)   /dashboard, /dashboard/profile, /dashboard/stats
src/app/api           /api/track/view, /api/track/click, /api/geocode
src/app/robots.ts     robots.txt (metadata route, must live at the app root)
src/components        ui, search, trainers, signup, seo
src/lib               supabase (client/server/public/admin/middleware), db, seo, analytics, validation
supabase/             config.toml, migrations/0001_init.sql, seed.sql, email templates
```

## Data model notes

- `profiles.id` references `auth.users`; new signups are inserted with `status = 'pending'` and
  only `active` profiles are publicly readable (RLS).
- Slugs are generated and de-duplicated by a trigger (`ana-garcia`, `ana-garcia-2`, ...).
- `whatsapp` / `phone` are not granted to `anon`; they are exposed only via
  `get_profile_contact()`, which returns them for active Pro profiles (or the owner).
- `profile_events` is written only by the server (`/api/track/*`, service-role key); owners can
  read their own events, aggregated by `get_profile_stats()` / `get_profile_click_breakdown()`.

## Environment

See `.env.example`. `SUPABASE_SERVICE_ROLE_KEY` is server-only (tracking writes).
`MAPBOX_ACCESS_TOKEN` is optional: without it, `/api/geocode` only searches seeded cities.
To activate a trainer, set `status = 'active'` on their `profiles` row (moderation).
