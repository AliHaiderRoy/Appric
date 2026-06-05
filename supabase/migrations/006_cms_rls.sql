-- 006_cms_rls.sql
-- CMS RLS: public read for published content, admin full control

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_client_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content_revisions ENABLE ROW LEVEL SECURITY;

-- Site settings (all keys are public-facing)
CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage site settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Services
CREATE POLICY "Anyone can read published services"
  ON site_services FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admin can manage services"
  ON site_services FOR ALL
  TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Portfolio
CREATE POLICY "Anyone can read published portfolio"
  ON site_portfolio FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admin can manage portfolio"
  ON site_portfolio FOR ALL
  TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Blog
CREATE POLICY "Anyone can read published blog posts"
  ON site_blog_posts FOR SELECT
  TO anon, authenticated
  USING (status = 'published' AND (published_at IS NULL OR published_at <= NOW()));

CREATE POLICY "Admin can manage blog posts"
  ON site_blog_posts FOR ALL
  TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Team
CREATE POLICY "Anyone can read published team members"
  ON site_team_members FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admin can manage team members"
  ON site_team_members FOR ALL
  TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Client logos
CREATE POLICY "Anyone can read published client logos"
  ON site_client_logos FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admin can manage client logos"
  ON site_client_logos FOR ALL
  TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Revisions (admin only)
CREATE POLICY "Admin can read content revisions"
  ON site_content_revisions FOR SELECT
  TO authenticated
  USING (get_user_role() = 'admin');

CREATE POLICY "Admin can insert content revisions"
  ON site_content_revisions FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'admin');

-- Enable Supabase Realtime for live website updates
ALTER TABLE site_settings REPLICA IDENTITY FULL;
ALTER TABLE site_services REPLICA IDENTITY FULL;
ALTER TABLE site_portfolio REPLICA IDENTITY FULL;
ALTER TABLE site_blog_posts REPLICA IDENTITY FULL;
ALTER TABLE site_team_members REPLICA IDENTITY FULL;
ALTER TABLE site_client_logos REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE site_settings;
    ALTER PUBLICATION supabase_realtime ADD TABLE site_services;
    ALTER PUBLICATION supabase_realtime ADD TABLE site_portfolio;
    ALTER PUBLICATION supabase_realtime ADD TABLE site_blog_posts;
    ALTER PUBLICATION supabase_realtime ADD TABLE site_team_members;
    ALTER PUBLICATION supabase_realtime ADD TABLE site_client_logos;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
