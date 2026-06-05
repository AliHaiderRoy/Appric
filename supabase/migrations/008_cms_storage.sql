-- CMS and public site images (portfolio, blog, team, client logos)
INSERT INTO storage.buckets (id, name, public) VALUES
  ('cms-images', 'cms-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "CMS images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cms-images');

CREATE POLICY "Admin can upload CMS images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cms-images'
    AND get_user_role() = 'admin'
  );

CREATE POLICY "Admin can update CMS images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'cms-images'
    AND get_user_role() = 'admin'
  );

CREATE POLICY "HR and admin can update news images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'news-images'
    AND get_user_role() IN ('admin', 'hr')
  );
