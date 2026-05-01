@AGENTS.md

# Cadre — Architecture & Objectives

## What this is
Twitter-like social network ("Horse Social" — "Share the ride. Connect the herd").
Core features: posts (text/images), feed, follow/unfollow, reactions, comments, reposts, profiles.

## Tech Stack
- **Next.js 16** (App Router, Server Components, Server Actions)
- **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Supabase** — Postgres + Auth + Storage (SSR via `@supabase/ssr`)
- **Vercel** deployment

## Folder Structure
```
src/
├── app/
│   ├── (auth)/          # Login, register pages
│   ├── (app)/           # Protected: feed, profile, post detail
│   ├── layout.tsx       # Root HTML + dark mode
│   └── page.tsx         # Landing page
├── components/          # Shared React components
├── lib/
│   ├── supabase/        # server.ts (SSR client), client.ts (browser)
│   ├── actions/         # Server Actions: auth, posts, reactions, follows
│   └── database.types.ts  # Generated from Supabase schema
└── middleware.ts         # Session refresh + route protection
```

## Key Architecture Decisions
- **Server Components** for all data fetching; no client-side fetch waterfalls
- **Server Actions** for all mutations (auth, posts, reactions, follows)
- **Direct browser → Supabase Storage** uploads (avoids 4.5 MB serverless limit)
- **RLS (Row-Level Security)** enforces all access control at the DB layer
- **Feed uses a single aggregated query** — no N+1 patterns
- Supabase SSR client is created per-request via `cookies()` from `next/headers`

## Auth & Routing
- `middleware.ts` refreshes session tokens and redirects:
  - Unauthenticated → `/login` for protected routes under `(app)/`
  - Authenticated → `/feed` if hitting auth routes
- Auth actions live in `src/lib/actions/auth.ts` (signup, login, logout)

## Supabase Schema (core tables)
`users`, `posts`, `follows`, `reactions`, `comments`, `reposts`
All tables have RLS; users can only mutate their own rows.

## Development Notes
- Read `node_modules/next/dist/docs/` before using any Next.js API — v16 has breaking changes
- Run `supabase gen types typescript` after schema changes to update `database.types.ts`
- Environment vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
