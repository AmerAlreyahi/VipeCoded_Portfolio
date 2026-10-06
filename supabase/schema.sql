-- 0. Master JSON Content Store (Full Fidelity)
CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Site configuration (Settings, Meta, Nav, Footer, CV)
CREATE TABLE site_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1, -- Only one row
  lang TEXT NOT NULL CHECK (lang IN ('en', 'ar')),
  cv_url TEXT,
  github_username TEXT,
  meta_title TEXT,
  meta_description TEXT,
  nav_json JSONB,    -- Stores navigation translation mapping
  footer_json JSONB, -- Stores footer mapping
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lang)
);

-- 2. Hero Section
CREATE TABLE hero_section (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'ar')),
  greeting TEXT,
  name TEXT,
  bio TEXT,
  cta_primary TEXT,
  cta_primary_href TEXT,
  cta_secondary TEXT,
  cta_secondary_href TEXT,
  roles TEXT[], -- Array of strings for the typing animation
  scroll_hint TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lang)
);

-- 3. About Section
CREATE TABLE about_section (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'ar')),
  section_label TEXT,
  heading TEXT,
  paragraphs TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lang)
);

-- 3.1 About Stats (e.g. 5+ Years Experience)
CREATE TABLE about_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'ar')),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- 4. Skills Section
CREATE TABLE skills_section (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'ar')),
  section_label TEXT,
  heading TEXT,
  UNIQUE(lang)
);

CREATE TABLE skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'ar')),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  level INTEGER,
  category TEXT DEFAULT 'frontend',
  color TEXT DEFAULT '#61dafb',
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- 5. Projects Section
CREATE TABLE projects_section (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'ar')),
  section_label TEXT,
  heading TEXT,
  UNIQUE(lang)
);

CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'ar')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  tags TEXT[],
  category TEXT,
  featured BOOLEAN DEFAULT false,
  primary_link_url TEXT,
  secondary_link_url TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 6. Career / Experience Section
CREATE TABLE career_section (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'ar')),
  section_label TEXT,
  heading TEXT,
  UNIQUE(lang)
);

CREATE TABLE career_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'ar')),
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 7. Social Links (Language-agnostic)
CREATE TABLE social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------

-- Enable RLS for all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Database-side admin allowlist. Manage this table only from the Supabase SQL
-- Editor or a trusted service-role process; never expose its rows to clients.
CREATE TABLE IF NOT EXISTS public.portfolio_admins (
  email TEXT PRIMARY KEY CHECK (email = lower(btrim(email)))
);
ALTER TABLE public.portfolio_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.portfolio_admins FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_portfolio_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.portfolio_admins
    WHERE email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
REVOKE ALL ON FUNCTION public.is_portfolio_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_portfolio_admin() TO authenticated;

-- Create read access policies for everyone (public)
CREATE POLICY "Allow public read access on site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Allow public read access on site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read access on hero_section" ON hero_section FOR SELECT USING (true);
CREATE POLICY "Allow public read access on about_section" ON about_section FOR SELECT USING (true);
CREATE POLICY "Allow public read access on about_stats" ON about_stats FOR SELECT USING (true);
CREATE POLICY "Allow public read access on skills_section" ON skills_section FOR SELECT USING (true);
CREATE POLICY "Allow public read access on skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Allow public read access on projects_section" ON projects_section FOR SELECT USING (true);
CREATE POLICY "Allow public read access on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access on career_section" ON career_section FOR SELECT USING (true);
CREATE POLICY "Allow public read access on career_items" ON career_items FOR SELECT USING (true);
CREATE POLICY "Allow public read access on social_links" ON social_links FOR SELECT USING (true);

-- Only emails explicitly added to portfolio_admins may write portfolio data.
CREATE POLICY "Portfolio admins write site_content" ON site_content
  FOR ALL TO authenticated USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());
CREATE POLICY "Portfolio admins write site_settings" ON site_settings
  FOR ALL TO authenticated USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());
CREATE POLICY "Portfolio admins write hero_section" ON hero_section
  FOR ALL TO authenticated USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());
CREATE POLICY "Portfolio admins write about_section" ON about_section
  FOR ALL TO authenticated USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());
CREATE POLICY "Portfolio admins write about_stats" ON about_stats
  FOR ALL TO authenticated USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());
CREATE POLICY "Portfolio admins write skills_section" ON skills_section
  FOR ALL TO authenticated USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());
CREATE POLICY "Portfolio admins write skills" ON skills
  FOR ALL TO authenticated USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());
CREATE POLICY "Portfolio admins write projects_section" ON projects_section
  FOR ALL TO authenticated USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());
CREATE POLICY "Portfolio admins write projects" ON projects
  FOR ALL TO authenticated USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());
CREATE POLICY "Portfolio admins write career_section" ON career_section
  FOR ALL TO authenticated USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());
CREATE POLICY "Portfolio admins write career_items" ON career_items
  FOR ALL TO authenticated USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());
CREATE POLICY "Portfolio admins write social_links" ON social_links
  FOR ALL TO authenticated USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());

-- =============================================================================
-- STORAGE BUCKETS AND POLICIES FOR PORTFOLIO
-- =============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true) ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Read Portfolio Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Portfolio Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Portfolio Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Portfolio Storage" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio admins insert Storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio admins update Storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio admins delete Storage objects" ON storage.objects;

CREATE POLICY "Public Read Portfolio Storage" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "Portfolio admins insert Storage objects" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio' AND public.is_portfolio_admin());
CREATE POLICY "Portfolio admins update Storage objects" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_portfolio_admin())
  WITH CHECK (bucket_id = 'portfolio' AND public.is_portfolio_admin());
CREATE POLICY "Portfolio admins delete Storage objects" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_portfolio_admin());
