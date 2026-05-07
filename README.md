# Savings Challenge (Nuxt 3 · Offline-first PWA)

Customizable savings tracker inspired by the 52-week challenge.

## What’s implemented (scaffold)

- **Nuxt 3 + TypeScript strict** (source in `app/`)
- **TailwindCSS** (dark mode via `class`)
- **Pinia stores** for settings, challenge, tips, and sync
- **Offline-first persistence** (LocalStorage schema versioned + validated)
- **Optional Supabase sync** (disabled unless env vars are set)
- **PWA** manifest + service worker (via `@vite-pwa/nuxt`)
- **Core pages/components**: onboarding, dashboard, weekly checklist, tips, milestones

## Project structure (Nuxt 3 optimized)

```
app/
  assets/css/tailwind.css
  components/
    BadgePill.vue
    MilestonesRow.vue
    ProgressChart.vue
    ProgressRing.vue
    TipsPanel.vue
    WeeklyChecklist.vue
  layouts/default.vue
  pages/
    index.vue
    onboarding.vue
    settings.vue
  plugins/
    persist.client.ts
    supabase.client.ts
  stores/
    challenge.ts
    settings.ts
    sync.ts
    tips.ts
  types/challenge.ts
  utils/
    challenge.ts
    money.ts
    storage.ts
public/
  icon.svg
nuxt.config.ts
tailwind.config.ts
```

## Stores (schema overview)

- **`useChallengeStore`** (`app/stores/challenge.ts`)
  - **state**: `challenge?: ChallengeSettings`, `progress?: ChallengeProgress`
  - **getters**: projected total, paid total, remaining, percent complete, week amount/date, streaks
  - **actions**: configure, mark/unmark week paid (supports `unitsPaid` for double-up), reset
- **`useSettingsStore`** (`app/stores/settings.ts`): locale/theme/reminders flags
- **`useTipsStore`** (`app/stores/tips.ts`): quote rotation + tips by difficulty
- **`useSyncStore`** (`app/stores/sync.ts`): optional Supabase push/pull with error state

## Environment variables

Copy `.env.example` to `.env` (optional; only needed for Supabase sync):

```bash
NUXT_PUBLIC_SUPABASE_URL=
NUXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Setup

Make sure to install dependencies:

```bash
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

## Deploy (Vercel / Netlify / Cloudflare Pages)

### Vercel

- **Framework preset**: Nuxt
- **Build command**: `npm run build`
- **Output**: (auto-detected)
- **Env vars**: add `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_ANON_KEY` (optional)

### Netlify

- **Build command**: `npm run build`
- **Publish directory**: `.output/public`
- **Env vars**: same as above

### Cloudflare Pages

- **Build command**: `npm run build`
- **Build output**: `.output/public`
- **Node version**: use the latest supported LTS

## Supabase configuration (auth + sync)

1. Create a project at [Supabase](https://supabase.com/dashboard).
2. Go to **Project Settings → API**.
3. Copy **Project URL** → `NUXT_PUBLIC_SUPABASE_URL`
4. Copy **anon public** key → `NUXT_PUBLIC_SUPABASE_ANON_KEY`
5. In the project root, edit `.env` (copy from `.env.example` if needed) and paste both values.
6. Restart the dev server (`npm run dev`).

**Authentication providers** (Dashboard → **Authentication → Providers**):

- Enable **Email** for magic-link OTP.
- Enable **Phone** for SMS OTP (configure an SMS provider if required).

**Redirect URLs** (Dashboard → **Authentication → URL Configuration**):

- Add `http://localhost:3000` for local dev.
- Add your production URL when you deploy.

## Supabase sync (optional)

Create a table `user_states`:

```sql
create table if not exists public.user_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state_json jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.user_states enable row level security;

create policy "users can read own state"
on public.user_states for select
using (auth.uid() = user_id);

create policy "users can upsert own state"
on public.user_states for insert
with check (auth.uid() = user_id);

create policy "users can update own state"
on public.user_states for update
using (auth.uid() = user_id);
```
