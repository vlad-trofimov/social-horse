ALTER TABLE public.posts ADD COLUMN embed_url TEXT;

-- Allow a post consisting of only an embed (no text or image)
ALTER TABLE public.posts DROP CONSTRAINT content_or_image;
ALTER TABLE public.posts ADD CONSTRAINT content_or_image
  CHECK (content IS NOT NULL OR image_url IS NOT NULL OR embed_url IS NOT NULL);
