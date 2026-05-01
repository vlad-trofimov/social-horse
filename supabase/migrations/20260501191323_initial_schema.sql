-- profiles: extends auth.users 1:1
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  bio           TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- posts
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

-- connections: directed follow graph
CREATE TABLE public.connections (
  follower_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

-- reactions: one per user per post
CREATE TYPE reaction_type AS ENUM ('like', 'heart', 'laugh', 'wow');

CREATE TABLE public.reactions (
  post_id       UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type          reaction_type NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  PRIMARY KEY (post_id, user_id)
);

-- comments
CREATE TABLE public.comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- indexes
CREATE INDEX idx_posts_author_created  ON public.posts(author_id, created_at DESC);
CREATE INDEX idx_comments_post_id      ON public.comments(post_id, created_at ASC);
CREATE INDEX idx_connections_follower  ON public.connections(follower_id);
CREATE INDEX idx_connections_following ON public.connections(following_id);
CREATE INDEX idx_reactions_post_id     ON public.reactions(post_id);

-- auto-create profile on signup
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

-- RLS
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments    ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own"    ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- posts policies
CREATE POLICY "posts_select_authenticated" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "posts_insert_own"           ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_delete_own"           ON public.posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- connections policies
CREATE POLICY "connections_select_authenticated" ON public.connections FOR SELECT TO authenticated USING (true);
CREATE POLICY "connections_insert_own"           ON public.connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "connections_delete_own"           ON public.connections FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- reactions policies
CREATE POLICY "reactions_select_authenticated" ON public.reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "reactions_insert_own"           ON public.reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_delete_own"           ON public.reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- comments policies
CREATE POLICY "comments_select_authenticated" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments_insert_own"           ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_delete_own"           ON public.comments FOR DELETE TO authenticated USING (auth.uid() = author_id);
