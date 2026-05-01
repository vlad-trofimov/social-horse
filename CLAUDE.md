@AGENTS.md

# Cadre — Architecture & Objectives

## What this is
Twitter-like social network ("Horse Social" — "Share the ride. Connect the herd").
Core features: posts (text/images/embeds), feed, friend connections, reactions, comments, reposts, profiles, search.

## Tech Stack
- **Next.js 16.2.4** (App Router, Server Components, Server Actions)
- **React 19.2.4** + **TypeScript 5**
- **Tailwind CSS 4** (PostCSS plugin)
- **Zod 4** — server action input validation
- **Supabase** — Postgres + Auth + Storage (SSR via `@supabase/ssr@0.10.2`, `@supabase/supabase-js@2`)
- **Vercel** deployment

## Folder Structure
```
src/
├── app/
│   ├── (auth)/               # Login, register pages
│   ├── (app)/                # Protected route group
│   │   ├── layout.tsx
│   │   ├── feed/             # Main feed (page, loading, error)
│   │   ├── post/[id]/        # Post detail view (page, loading, error)
│   │   ├── profile/[username]/  # Public profile (page, loading, error)
│   │   ├── profile/edit/     # Profile editing (page, loading, error)
│   │   └── search/           # Search results (page, loading, error)
│   ├── auth/callback/route.ts  # OAuth callback
│   ├── check-email/page.tsx  # Email verification notice
│   ├── layout.tsx            # Root HTML + Geist fonts + dark mode
│   └── page.tsx              # Landing page
├── components/
│   ├── feed/                 # CreatePostForm, PostCard, PostActions, FeedContainer,
│   │                         #   DeletePostButton, RepostBadge
│   ├── comments/             # CommentForm, CommentList, DeleteCommentButton
│   ├── profile/              # ProfileHeader, ProfileEditForm, FriendButton,
│   │                         #   FriendRequestsList
│   └── ui/                   # EmbedPlayer, ImageModal, SearchBar, SubmitButton,
│                             #   ThemeToggle
├── lib/
│   ├── supabase/             # server.ts (SSR client), client.ts (browser client)
│   ├── actions/              # Server Actions: auth, posts, comments, reactions,
│   │                         #   connections, profile
│   ├── queries/              # Data fetching: feed.ts, post.ts, profile.ts
│   ├── embeds.ts             # YouTube/Spotify URL detection & embed helpers
│   └── database.types.ts     # Generated from Supabase schema
└── middleware.ts              # Session refresh + route protection
```

## Key Architecture Decisions
- **Server Components** for all data fetching; no client-side fetch waterfalls
- **Server Actions** for all mutations (auth, posts, reactions, connections); all validated with Zod
- **Separate queries layer** (`lib/queries/`) — async functions called from server components; no N+1 patterns
- **Direct browser → Supabase Storage** uploads (avoids 4.5 MB serverless limit)
- **RLS (Row-Level Security)** enforces all access control at the DB layer
- Supabase SSR client is created per-request via `cookies()` from `next/headers`
- Dark mode persisted via `localStorage`; no flash on load

## Auth & Routing
- `middleware.ts` refreshes session tokens and redirects:
  - Unauthenticated → `/login` for protected routes under `(app)/`
  - Authenticated → `/feed` if hitting `/login` or `/register`
- Auth actions live in `src/lib/actions/auth.ts` (signup, login, logout)
- OAuth callback handled at `src/app/auth/callback/route.ts`
- `NEXT_PUBLIC_SITE_URL` used as redirect base for auth email links

## Supabase Schema (core tables)
- **profiles** — `id`, `username` (unique), `display_name`, `bio`, `avatar_url`; 1:1 with `auth.users`; auto-created on signup via trigger
- **posts** — `author_id`, `content`, `image_url`, `embed_url`, `repost_of` (self-FK); at least one content field required
- **connections** — bidirectional friend model: `requester_id`, `addressee_id`, `status` (enum: `pending` | `accepted` | `declined`)
- **reactions** — PK `(post_id, user_id)`, `type` enum: `like` | `heart` | `laugh` | `wow`
- **comments** — `post_id`, `author_id`, `content`

All tables have RLS. Storage buckets: `avatars`, `post-images` (both public; user-scoped write policies; SELECT policy required for upsert to work).

## Post Features
- Text (up to 1000 chars), image (Supabase Storage), or embedded media
- Embeds auto-detected from text: YouTube (`youtube.com/watch`, `youtu.be/`, `youtube.com/shorts/`) and Spotify (`open.spotify.com/track|album|playlist|episode`)
- Rendered via `EmbedPlayer` component using `youtube-nocookie.com` and Spotify embed URLs
- Reposts reference original post via `repost_of` FK

## Feed
- Shows own posts + posts from accepted friends
- 20 posts per page
- Reaction counts, comment counts, repost attribution all fetched in one query

## Development Notes
- Read `node_modules/next/dist/docs/` before using any Next.js API — v16 has breaking changes
- Run `supabase gen types typescript` after schema changes to update `database.types.ts`
- Environment vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`
- 5 migration files in `supabase/migrations/`: initial schema → storage buckets → connections refactor → embed_url column → storage SELECT policies
