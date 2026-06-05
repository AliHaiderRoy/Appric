-- 002_rls_policies.sql
-- Row Level Security policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "HR and admin can read all profiles"
  ON profiles FOR SELECT
  USING (get_user_role() IN ('admin', 'hr'));

CREATE POLICY "Managers can read team profiles"
  ON profiles FOR SELECT
  USING (
    get_user_role() = 'manager'
    AND (manager_id = auth.uid() OR id = auth.uid())
  );

CREATE POLICY "Users can update own profile limited"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    AND status = (SELECT status FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "HR and admin can update any profile"
  ON profiles FOR UPDATE
  USING (get_user_role() IN ('admin', 'hr'));

CREATE POLICY "HR and admin can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'hr'));

-- Departments
CREATE POLICY "Authenticated users can read departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "HR and admin can manage departments"
  ON departments FOR ALL
  USING (get_user_role() IN ('admin', 'hr'));

-- Attendance
CREATE POLICY "Employees can read own attendance"
  ON attendance FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Managers can read team attendance"
  ON attendance FOR SELECT
  USING (
    get_user_role() IN ('admin', 'hr')
    OR is_manager_of(user_id)
  );

CREATE POLICY "HR and admin can read all attendance"
  ON attendance FOR SELECT
  USING (get_user_role() IN ('admin', 'hr'));

CREATE POLICY "Employees can insert own attendance"
  ON attendance FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Employees can update own attendance"
  ON attendance FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Announcements
CREATE POLICY "Users can read published announcements"
  ON announcements FOR SELECT
  USING (
    is_published = true
    AND (publish_at IS NULL OR publish_at <= NOW())
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (
      target_audience = 'all'
      OR (target_audience = 'department' AND target_department_id = (SELECT department_id FROM profiles WHERE id = auth.uid()))
      OR (target_audience = 'role' AND target_role::text = get_user_role())
    )
  );

CREATE POLICY "HR and admin can read all announcements"
  ON announcements FOR SELECT
  USING (get_user_role() IN ('admin', 'hr'));

CREATE POLICY "HR and admin can manage announcements"
  ON announcements FOR ALL
  USING (get_user_role() IN ('admin', 'hr'));

-- Announcement reads
CREATE POLICY "Users can read own announcement reads"
  ON announcement_reads FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can mark announcements as read"
  ON announcement_reads FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Office news
CREATE POLICY "Users can read published news"
  ON office_news FOR SELECT
  USING (is_published = true);

CREATE POLICY "HR and admin can read all news"
  ON office_news FOR SELECT
  USING (get_user_role() IN ('admin', 'hr'));

CREATE POLICY "HR and admin can manage news"
  ON office_news FOR ALL
  USING (get_user_role() IN ('admin', 'hr'));

-- Leave requests
CREATE POLICY "Employees can read own leave"
  ON leave_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Managers can read team leave"
  ON leave_requests FOR SELECT
  USING (
    get_user_role() IN ('admin', 'hr')
    OR is_manager_of(user_id)
  );

CREATE POLICY "HR and admin can read all leave"
  ON leave_requests FOR SELECT
  USING (get_user_role() IN ('admin', 'hr'));

CREATE POLICY "Employees can create own leave"
  ON leave_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Employees can update own pending leave"
  ON leave_requests FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers can approve team leave"
  ON leave_requests FOR UPDATE
  USING (
    get_user_role() IN ('admin', 'hr')
    OR (get_user_role() = 'manager' AND is_manager_of(user_id))
  );

-- Office settings
CREATE POLICY "Authenticated users can read settings"
  ON office_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage settings"
  ON office_settings FOR ALL
  USING (get_user_role() = 'admin');

-- Audit logs
CREATE POLICY "Admin can read audit logs"
  ON audit_logs FOR SELECT
  USING (get_user_role() = 'admin');

CREATE POLICY "Admin can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (get_user_role() = 'admin' OR user_id = auth.uid());

-- Storage buckets (run in Supabase dashboard or via API)
-- avatars: public read, authenticated upload own
-- news-images: public read, hr/admin upload
