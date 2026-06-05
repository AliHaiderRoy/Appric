-- 004_seed_data.sql
-- Development seed data (run AFTER creating auth users via Supabase dashboard or admin API)
-- NOTE: Replace UUIDs with actual auth.users IDs after creating users

-- This seed assumes you manually create users first, then run profile updates.
-- See README for bootstrap instructions.

-- Departments (safe to run without users)
INSERT INTO departments (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Engineering', 'Software development team'),
  ('11111111-1111-1111-1111-111111111102', 'Human Resources', 'HR and people operations'),
  ('11111111-1111-1111-1111-111111111103', 'Design', 'UI/UX and creative team')
ON CONFLICT (name) DO NOTHING;

-- Sample announcements (requires at least one profile — skip if no profiles exist)
-- Uncomment and replace published_by UUID after first admin is created:
/*
INSERT INTO announcements (title, content, priority, target_audience, published_by, is_published, is_pinned) VALUES
  ('Welcome to APPRIC Office Dashboard', 'Our new internal dashboard is live! Use it for attendance, announcements, and leave requests.', 'high', 'all', '<ADMIN_USER_ID>', true, true),
  ('Office Hours Update', 'Standard office hours are 9:00 AM to 6:00 PM. Remote work requires manager approval.', 'normal', 'all', '<ADMIN_USER_ID>', true, false),
  ('Team Building Event', 'Join us this Friday for a team lunch at 1 PM.', 'normal', 'all', '<HR_USER_ID>', true, false);
*/

-- Sample office news
/*
INSERT INTO office_news (title, slug, excerpt, content, category, author_id, is_published, published_at) VALUES
  ('APPRIC Wins Best Startup Award', 'appric-wins-award', 'We are proud to announce...', 'Full article content here.', 'achievement', '<ADMIN_USER_ID>', true, NOW()),
  ('New Leave Policy 2026', 'leave-policy-2026', 'Updated leave guidelines...', 'Policy details here.', 'policy', '<HR_USER_ID>', true, NOW());
*/

-- Storage buckets (run in Supabase SQL editor)
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "News images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'news-images');

CREATE POLICY "HR and admin can upload news images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'news-images'
    AND get_user_role() IN ('admin', 'hr')
  );
