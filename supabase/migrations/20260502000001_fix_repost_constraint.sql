-- Allow repost rows to have no content/image — repost_of presence is sufficient
ALTER TABLE public.posts DROP CONSTRAINT content_or_image;

ALTER TABLE public.posts ADD CONSTRAINT content_or_image CHECK (
  repost_of IS NOT NULL
  OR content IS NOT NULL
  OR image_url IS NOT NULL
);
