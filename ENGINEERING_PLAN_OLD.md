# Social Network Platform — Engineering Plan

## Architecture Overview

**Stack:** Next.js 15 App Router + Supabase (auth, Postgres, storage). Server Components for data fetching, Server Actions for all mutations — no separate API layer needed. Client Components only where interactivity is required (reaction buttons, forms, follow toggle).

**Request Flow:**
```
Browser
  -> Next.js Server Component (RSC)
       -> supabase-js (server client, user JWT)
            -> Supabase Postgres (RLS enforced)
            -> Supabase Storage (RLS enforced)
  -> Server Action (mutations)
       -> supabase-js (server client)
            -> Postgres / Storage
```

**Deployment:** Vercel (Next.js) + Supabase Cloud

---

## Project Structure

```
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Landing page (unauthenticated)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx              # App shell: sidebar nav, auth guard
│   │   ├── feed/page.tsx
│   │   ├── profile/
│   │   │   ├── [username]/page.tsx
│   │   │   └── edit/page.tsx
│   │   └── post/
│   │       └── [id]/page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── feed/
│   │   ├── FeedContainer.tsx       # Server component, fetches posts
│   │   ├── PostCard.tsx            # Renders one post (server)
│   │   ├── PostActions.tsx         # Reactions/comments/repost (client)
│   │   ├── CreatePostForm.tsx      # New post composer (client)
│   │   └── RepostBadge.tsx
│   ├── profile/
│   │   ├── Avatar.tsx
│   │   ├── ProfileHeader.tsx
│   │   ├── FriendButton.tsx        # Client component
│   │   ├── FriendRequestsList.tsx  # Client component
│   │   └── ProfileEditForm.tsx     # Client component
│   ├── comments/
│   │   ├── CommentList.tsx
│   │   └── CommentForm.tsx
│   └── ui/                         # Shared primitives (Button, Input, Modal)
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client (singleton)
│   │   ├── server.ts               # Server client (cookies-based, per-request)
│   │   └── middleware.ts
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── posts.ts
│   │   ├── reactions.ts
│   │   ├── comments.ts
│   │   ├── connections.ts
│   │   └── profile.ts
│   ├── queries/
│   │   ├── feed.ts
│   │   ├── profile.ts
│   │   └── post.ts
│   └── types.ts
├── middleware.ts
└── supabase/
    ├── migrations/
    │   ├── 001_initial_schema.sql
    │   ├── 002_rls_policies.sql
    │   └── 003_storage_buckets.sql
    └── seed.sql
```

---

## Database Schema

### Tables

**`profiles`** — extends `auth.users` 1:1
```sql
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  bio           TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

**`posts`**
```sql
CREATE TABLE public.posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content       TEXT,
  image_url     TEXT,
  repost_of     UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT content_or_image CHECK (
    content IS NOT NULL OR image_url IS NOT NULL
  )
);
```

**`connections`** — bidirectional friend graph with accept flow
```sql
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined');

CREATE TABLE public.connections (
  requester_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        connection_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  PRIMARY KEY (requester_id, addressee_id),
  CONSTRAINT no_self_friend CHECK (requester_id <> addressee_id)
);
```

**`reactions`** — one per user per post
```sql
CREATE TYPE reaction_type AS ENUM ('like', 'heart', 'laugh', 'wow');

CREATE TABLE public.reactions (
  post_id       UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type          reaction_type NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  PRIMARY KEY (post_id, user_id)
);
```

**`comments`**
```sql
CREATE TABLE public.comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

### Indexes

```sql
CREATE INDEX idx_posts_author_created  ON public.posts(author_id, created_at DESC);
CREATE INDEX idx_comments_post_id      ON public.comments(post_id, created_at ASC);
CREATE INDEX idx_connections_requester  ON public.connections(requester_id);
CREATE INDEX idx_connections_addressee  ON public.connections(addressee_id);
CREATE INDEX idx_connections_status     ON public.connections(status);
CREATE INDEX idx_reactions_post_id     ON public.reactions(post_id);
```

### Triggers

```sql
-- Auto-create profile row on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g'),
    NEW.raw_user_meta_data->>'display_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at maintenance
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### RLS Policies

```sql
-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own"    ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_select_authenticated" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "posts_insert_own"           ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_delete_own"           ON public.posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
-- Users can see requests they sent or received
CREATE POLICY "connections_select_own" ON public.connections FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
-- Only the requester can send a friend request
CREATE POLICY "connections_insert_own" ON public.connections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);
-- Only the addressee can accept/decline; either party can delete (unfriend/cancel)
CREATE POLICY "connections_update_addressee" ON public.connections FOR UPDATE TO authenticated
  USING (auth.uid() = addressee_id);
CREATE POLICY "connections_delete_own" ON public.connections FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- reactions
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions_select_authenticated" ON public.reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "reactions_insert_own"           ON public.reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_delete_own"           ON public.reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_select_authenticated" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments_insert_own"           ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_delete_own"           ON public.comments FOR DELETE TO authenticated USING (auth.uid() = author_id);
```

---

## Storage Setup

| Bucket | Public | Purpose |
|---|---|---|
| `avatars` | true | Profile pictures |
| `post-images` | true | Images attached to posts |

**File path conventions:**
- Avatars: `avatars/{user_id}/avatar.{ext}` — always overwritten
- Post images: `post-images/{user_id}/{post_id}.{ext}`

Uploads go **browser → Supabase Storage directly** using the user's JWT. This bypasses the Next.js server and avoids Vercel's 4.5MB body limit. The resulting public URL is then passed to the Server Action to save alongside the post record.

**Storage RLS Policies:**
```sql
CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING     (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING     (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "post_images_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "post_images_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING     (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

## Auth Flow

**Registration:**
1. `RegisterForm` submits to `register()` Server Action
2. Calls `supabase.auth.signUp({ email, password, options: { data: { display_name } } })`
3. `handle_new_user` trigger creates `profiles` row
4. On email confirmation → redirect to `/feed`

**Login:**
1. `LoginForm` submits to `login()` Server Action
2. Calls `supabase.auth.signInWithPassword()`
3. `@supabase/ssr` sets `sb-*` cookies
4. Redirect to `/feed`

**Session refresh:**
`middleware.ts` runs on every request, calls `supabase.auth.getUser()`, refreshes the token if needed, and redirects unauthenticated users away from protected routes.

```typescript
// middleware.ts — simplified
export async function middleware(request: NextRequest) {
  const { supabase, response } = createServerClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  const isAppRoute = request.nextUrl.pathname.startsWith('/(app)')
  if (!user && isAppRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}
```

**Logout:** Server Action calls `supabase.auth.signOut()`, clears cookies, redirects to `/`.

---

## Pages & Components

### Routes

| Route | Auth | Description |
|---|---|---|
| `/` | No | Landing page with login CTA |
| `/login` | No | Login form |
| `/register` | No | Registration form |
| `/feed` | Yes | Home feed |
| `/profile/[username]` | Yes | Public profile view |
| `/profile/edit` | Yes | Edit own profile |
| `/post/[id]` | Yes | Single post + comment thread |

### Component Breakdown

**Feed (`/feed`)**
- `FeedContainer` (Server) → executes feed query
  - `CreatePostForm` (Client) → text + image; calls `createPost`; `router.refresh()` on success
  - `PostCard` (Server) → author info, content, image, counts
    - `PostActions` (Client) → reaction toggle, comment link, repost; `useOptimistic`
    - `RepostBadge` (Server) → shown when `repost_of` is set

**Profile (`/profile/[username]`)**
- `ProfileHeader` (Server) → avatar, name, bio, friend count; post list visible only to accepted friends
  - `FriendButton` (Client) → shows state-aware label: "Add Friend" / "Pending" / "Friends" / "Accept"
- Post list reuses `PostCard` (rendered only when friendship is accepted)

**Post detail (`/post/[id]`)**
- `PostCard` (full detail)
- `CommentList` (Server) → ordered by `created_at ASC`
- `CommentForm` (Client) → calls `addComment`

**Profile edit (`/profile/edit`)**
- `ProfileEditForm` (Client) → avatar uploads direct to storage; other fields via `updateProfile`

---

## Server Actions

| File | Actions |
|---|---|
| `auth.ts` | `register`, `login`, `logout` |
| `posts.ts` | `createPost`, `deletePost`, `repost` |
| `reactions.ts` | `toggleReaction` |
| `comments.ts` | `addComment`, `deleteComment` |
| `connections.ts` | `sendFriendRequest`, `acceptFriendRequest`, `declineFriendRequest`, `removeFriend` |
| `profile.ts` | `updateProfile` |

All mutations call `revalidatePath()` on the relevant route segment after completion. Use `zod` for input validation on all actions.

---

## Feed Query

Single aggregated SQL query — no N+1:

```sql
SELECT
  p.*,
  pr.username, pr.display_name, pr.avatar_url,
  COUNT(DISTINCT r.user_id)                                   AS reaction_count,
  COUNT(DISTINCT c.id)                                        AS comment_count,
  MAX(CASE WHEN r.user_id = $viewerId THEN r.type END)        AS viewer_reaction
FROM posts p
JOIN profiles pr ON pr.id = p.author_id
LEFT JOIN reactions r ON r.post_id = p.id
LEFT JOIN comments c  ON c.post_id = p.id
WHERE p.author_id IN (
  -- accepted friends (bidirectional)
  SELECT CASE
    WHEN requester_id = $userId THEN addressee_id
    ELSE requester_id
  END
  FROM connections
  WHERE (requester_id = $userId OR addressee_id = $userId)
    AND status = 'accepted'
)
OR p.author_id = $userId
GROUP BY p.id, pr.id
ORDER BY p.created_at DESC
LIMIT 20 OFFSET $offset;
```

---

## Key User Journey Data Flows

**Create post (with image):**
```
CreatePostForm
  1. User picks image → browser uploads to Supabase Storage → returns publicUrl
  2. User submits (content + publicUrl)
  -> createPost() server action → INSERT posts row → revalidatePath('/feed')
  -> FeedContainer re-renders
```

**React to post:**
```
PostActions (useOptimistic)
  1. User clicks → optimistic update (count +1, button highlighted)
  -> toggleReaction() server action
    -> no existing: INSERT
    -> same type: DELETE (toggle off)
    -> different type: UPDATE type
  -> revalidatePath reconciles with server truth
```

**Friend request flow:**
```
FriendButton (useOptimistic)
  1. "Add Friend" clicked → optimistic "Pending"
  -> sendFriendRequest() server action
    -> INSERT connections row (status = 'pending')
    -> revalidatePath('/profile/[username]')

  2. Addressee sees "Accept" on sender's profile (or future notifications UI)
  -> acceptFriendRequest() server action
    -> UPDATE connections SET status = 'accepted'
    -> revalidatePath('/profile/[username]')
    Both users can now see each other's posts in feed and view profiles

  3. Addressee clicks "Decline"
  -> declineFriendRequest() server action
    -> UPDATE connections SET status = 'declined'

  4. Either party clicks "Remove Friend" / "Cancel Request"
  -> removeFriend() server action
    -> DELETE connections row
```

---

## Implementation Phases

### Phase 1 — Foundation (Days 1–3)
- Init Next.js project with App Router + TypeScript
- Create Supabase project; run `001_initial_schema.sql`
- Configure `@supabase/ssr`: server and browser clients
- Implement `middleware.ts` for session refresh + route protection
- Build auth pages and server actions (register, login, logout)
- Verify profile auto-creation trigger end-to-end
- Basic app shell layout with navigation

**Exit criteria:** User can register, log in, see app shell, log out. Profile row created automatically.

### Phase 2 — Posts & Feed (Days 4–6)
- Run `003_storage_buckets.sql`; configure storage RLS
- Build `CreatePostForm` with direct-to-storage image upload
- Implement `createPost` server action and `getFeedPosts` query
- Build `FeedContainer`, `PostCard`, `RepostBadge`
- Implement `repost` server action
- Wire up feed page end-to-end

**Exit criteria:** User can create text and image posts; feed shows own posts in reverse-chronological order.

### Phase 3 — Friend Graph (Days 7–8)
- Add `connection_status` enum and `updated_at` to `connections` table migration
- Implement `sendFriendRequest`, `acceptFriendRequest`, `declineFriendRequest`, `removeFriend` server actions
- Build `FriendButton` (Client) with `useOptimistic` — renders correct label based on connection state: "Add Friend" / "Pending" / "Accept" / "Friends"
- Build `/profile/[username]` with `ProfileHeader`; gate post list behind accepted friendship check
- Update `getFeedPosts` to filter by accepted friends (bidirectional query)
- Build `/profile/edit` with avatar upload + bio edit
- Add pending friend requests list to profile or app shell so the addressee can act on incoming requests

**Exit criteria:** User can send a friend request; recipient can accept or decline; once accepted, both see each other's posts in the feed and can view each other's profiles; declined/pending users see a locked profile (name/avatar only).

### Phase 4 — Reactions & Comments (Days 9–11)
- Implement `toggleReaction` server action
- Build `PostActions` with optimistic reaction toggle
- Implement `addComment` / `deleteComment` and `getPostWithComments` query
- Build `/post/[id]` with `CommentList` and `CommentForm`
- Thread comment count in `PostCard` as link to detail page

**Exit criteria:** Users can react, toggle reactions off, comment, and delete own comments.

### Phase 5 — Polish & Hardening (Days 12–14)
- Zod validation on all server actions
- Error boundary components for feed and post detail
- `loading.tsx` files for each route segment
- Empty state: "Follow some people to see their posts"
- Mobile-responsive layout pass
- Generate TypeScript types: `supabase gen types typescript`
- RLS policy audit
- Test `CHECK` constraint on posts

**Exit criteria:** App handles errors gracefully, is usable on mobile, all types are generated from schema.

---

## Critical Files

| File | Why it's critical |
|---|---|
| `supabase/migrations/001_initial_schema.sql` | All tables, indexes, and the `handle_new_user` trigger — everything downstream depends on this |
| `lib/supabase/server.ts` | Per-request server client used by every Server Component and Server Action |
| `middleware.ts` | Session refresh + route protection — a bug here breaks auth globally |
| `lib/queries/feed.ts` | The aggregated feed query is the most complex and performance-sensitive path |

---

## Technical Decision Notes

- **Server Actions over API Routes** — colocate mutation logic with components, no separate fetch layer, native `revalidatePath` integration
- **Direct browser upload to storage** — avoids Vercel's 4.5MB serverless body limit for binary files
- **Single aggregated feed query** — avoids N+1; sufficient for this scale without a materialized view
- **`useOptimistic` for reactions and follow** — highest-frequency interactions; instant feedback with automatic rollback on error
- **`PRIMARY KEY (post_id, user_id)` on reactions** — enforces one reaction per user at the DB level; makes toggle logic race-condition-safe via upsert
