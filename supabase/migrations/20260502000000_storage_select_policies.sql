-- Allow authenticated users to read objects they own (needed for upsert to work)
CREATE POLICY "avatars_select_own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "post_images_select_own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'post-images');
