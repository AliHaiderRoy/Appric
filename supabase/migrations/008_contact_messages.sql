-- 008_contact_messages.sql
-- Public contact form submissions + admin real-time inbox

CREATE TYPE contact_message_status AS ENUM ('new', 'read', 'replied', 'archived');

CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  status contact_message_status NOT NULL DEFAULT 'new',
  admin_reply TEXT,
  replied_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  read_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created ON contact_messages(created_at DESC);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public visitors can submit the contact form
CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin and HR can view and manage inbox
CREATE POLICY "Admin and HR can read contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (get_user_role() IN ('admin', 'hr'));

CREATE POLICY "Admin and HR can update contact messages"
  ON contact_messages FOR UPDATE
  TO authenticated
  USING (get_user_role() IN ('admin', 'hr'))
  WITH CHECK (get_user_role() IN ('admin', 'hr'));

CREATE POLICY "Admin can delete contact messages"
  ON contact_messages FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');

-- Real-time inbox updates
ALTER TABLE contact_messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Sync contact page CMS settings with current business info
UPDATE site_settings
SET value = '{
  "email": "appric172@gmail.com",
  "phone": "05811558599",
  "address": "In front of CMH Main Gate, City Gilgit, Pakistan",
  "hours": "Mon - Fri: 9:00 AM - 6:00 PM",
  "heading": "Get in Touch",
  "subheading": "Have a project in mind? Let''s discuss how we can help bring your vision to life.",
  "mapUrl": "https://maps.app.goo.gl/BKo5ZswJ8rFC8hzD9?g_st=am",
  "businessHours": {
    "weekdays": "9:00 AM - 6:00 PM",
    "saturday": "10:00 AM - 4:00 PM",
    "sunday": "Closed"
  }
}'::jsonb
WHERE key = 'contact';
