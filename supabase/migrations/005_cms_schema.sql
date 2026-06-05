-- 005_cms_schema.sql
-- Public website CMS (enterprise content management)

CREATE TYPE cms_content_status AS ENUM ('draft', 'published', 'archived');

-- Key/value site configuration (hero, stats, contact, about intro)
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Marketing services
CREATE TABLE site_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  icon TEXT NOT NULL DEFAULT 'Code',
  color_gradient TEXT NOT NULL DEFAULT 'from-blue-500 to-cyan-500',
  sort_order INT NOT NULL DEFAULT 0,
  status cms_content_status NOT NULL DEFAULT 'published',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_site_services_sort ON site_services(sort_order);
CREATE INDEX idx_site_services_status ON site_services(status);

-- Portfolio projects
CREATE TABLE site_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  technologies JSONB NOT NULL DEFAULT '[]',
  project_url TEXT,
  github_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  status cms_content_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_site_portfolio_sort ON site_portfolio(sort_order);
CREATE INDEX idx_site_portfolio_status ON site_portfolio(status);

-- Public blog posts
CREATE TABLE site_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  author_name TEXT NOT NULL DEFAULT 'APPRIC Team',
  read_time TEXT NOT NULL DEFAULT '5 min read',
  image_url TEXT,
  status cms_content_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_site_blog_posts_slug ON site_blog_posts(slug);
CREATE INDEX idx_site_blog_posts_status ON site_blog_posts(status);

-- Team members (About page)
CREATE TABLE site_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  status cms_content_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_site_team_members_sort ON site_team_members(sort_order);

-- Client logos / trust badges
CREATE TABLE site_client_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  status cms_content_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_site_client_logos_sort ON site_client_logos(sort_order);

-- CMS audit trail
CREATE TABLE site_content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  snapshot JSONB,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_site_content_revisions_entity ON site_content_revisions(entity_type, entity_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_cms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_services_updated_at
  BEFORE UPDATE ON site_services
  FOR EACH ROW EXECUTE FUNCTION update_cms_updated_at();

CREATE TRIGGER site_portfolio_updated_at
  BEFORE UPDATE ON site_portfolio
  FOR EACH ROW EXECUTE FUNCTION update_cms_updated_at();

CREATE TRIGGER site_blog_posts_updated_at
  BEFORE UPDATE ON site_blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_cms_updated_at();

CREATE TRIGGER site_team_members_updated_at
  BEFORE UPDATE ON site_team_members
  FOR EACH ROW EXECUTE FUNCTION update_cms_updated_at();

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_cms_updated_at();
