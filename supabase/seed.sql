-- =============================================================================
-- COMPLETE SUPABASE SCHEMA & GENERIC SAMPLE SEED DATA (ENGLISH + ARABIC)
-- Replace all sample content with your own before publishing your portfolio.
-- =============================================================================
-- Copy and run this ENTIRE file in your Supabase SQL Editor!

-- 1. DROP EXISTING TABLES & RESET
DROP TABLE IF EXISTS site_content CASCADE;
DROP TABLE IF EXISTS social_links CASCADE;
DROP TABLE IF EXISTS career_items CASCADE;
DROP TABLE IF EXISTS career_section CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS projects_section CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS skills_section CASCADE;
DROP TABLE IF EXISTS about_stats CASCADE;
DROP TABLE IF EXISTS about_section CASCADE;
DROP TABLE IF EXISTS hero_section CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;

-- 2. CREATE TABLES WITH RLS & POLICIES

CREATE TABLE site_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE site_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  lang TEXT UNIQUE NOT NULL,
  cv_url TEXT DEFAULT '',
  github_username TEXT DEFAULT '',
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  nav_json JSONB DEFAULT '{}'::jsonb,
  footer_json JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE hero_section (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  lang TEXT UNIQUE NOT NULL,
  greeting TEXT NOT NULL,
  name TEXT NOT NULL,
  bio TEXT NOT NULL,
  cta_primary TEXT NOT NULL,
  cta_primary_href TEXT NOT NULL,
  cta_secondary TEXT NOT NULL,
  cta_secondary_href TEXT NOT NULL,
  roles TEXT[] DEFAULT '{}',
  scroll_hint TEXT DEFAULT ''
);

CREATE TABLE about_section (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  lang TEXT UNIQUE NOT NULL,
  section_label TEXT NOT NULL,
  heading TEXT NOT NULL,
  paragraphs TEXT[] DEFAULT '{}'
);

CREATE TABLE about_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lang TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE skills_section (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  lang TEXT UNIQUE NOT NULL,
  section_label TEXT NOT NULL,
  heading TEXT NOT NULL
);

CREATE TABLE skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lang TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  level INTEGER DEFAULT 90,
  category TEXT DEFAULT 'frontend',
  color TEXT DEFAULT '#61dafb',
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE projects_section (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  lang TEXT UNIQUE NOT NULL,
  section_label TEXT NOT NULL,
  heading TEXT NOT NULL
);

CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lang TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'web',
  featured BOOLEAN DEFAULT false,
  primary_link_url TEXT DEFAULT '',
  secondary_link_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE career_section (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  lang TEXT UNIQUE NOT NULL,
  section_label TEXT NOT NULL,
  heading TEXT NOT NULL
);

CREATE TABLE career_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lang TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  color TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

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

-- PUBLIC READ ACCESS
CREATE POLICY "Public Read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Public Read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read hero_section" ON hero_section FOR SELECT USING (true);
CREATE POLICY "Public Read about_section" ON about_section FOR SELECT USING (true);
CREATE POLICY "Public Read about_stats" ON about_stats FOR SELECT USING (true);
CREATE POLICY "Public Read skills_section" ON skills_section FOR SELECT USING (true);
CREATE POLICY "Public Read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public Read projects_section" ON projects_section FOR SELECT USING (true);
CREATE POLICY "Public Read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public Read career_section" ON career_section FOR SELECT USING (true);
CREATE POLICY "Public Read career_items" ON career_items FOR SELECT USING (true);
CREATE POLICY "Public Read social_links" ON social_links FOR SELECT USING (true);

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

-- Storage Bucket Policies
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


-- =============================================================================
-- 3. INSERT GENERIC SAMPLE CONTENT
-- =============================================================================

INSERT INTO site_content (id, content) VALUES ('main', '{
  "en": {
    "meta": {
      "title": "Sample Developer — Full-Stack Developer",
      "description": "A sample portfolio for a full-stack developer building modern web applications.",
      "favicon": "/favicon.ico"
    },
    "nav": {
      "logo": "Sample Developer",
      "logoSettings": {
        "colorType": "gradient",
        "gradientStart": "#7c5cfc",
        "gradientEnd": "#22d3ee",
        "logoType": "text",
        "animation": "gradient-flow"
      },
      "links": [
        { "label": "About", "href": "#about" },
        { "label": "Skills", "href": "#skills" },
        { "label": "Projects", "href": "#projects" },
        { "label": "Career", "href": "#career" },
        { "label": "Contact", "href": "#contact" }
      ]
    },
    "hero": {
      "greeting": "Hello, I am",
      "name": "Sample Developer",
      "bio": "Senior Full-Stack Engineer crafting high-performance, scalable web applications with modern technologies and interactive user experiences.",
      "cta_primary": "Explore Projects",
      "cta_primary_href": "#projects",
      "cta_secondary": "View CV",
      "cta_secondary_href": "/cv",
      "roles": ["Full-Stack Engineer", "Next.js & React Architect", "UI/UX Experience Specialist", "Cloud Solutions Architect"],
      "scroll_hint": "Scroll down"
    },
    "about": {
      "section_label": "About Me",
      "heading": "Architecting Digital Excellence & Scalable Web Solutions",
      "paragraphs": [
        "I am a sample developer building modern, reliable digital products with current web technologies.",
        "Replace this sample introduction with your own background, interests, and experience."
      ],
      "stats": [
        { "label": "Years Experience", "value": "X+" },
        { "label": "Completed Projects", "value": "X+" },
        { "label": "Satisfied Clients", "value": "X+" }
      ]
    },
    "skills": {
      "section_label": "Skills & Technologies",
      "heading": "Technologies I Master",
      "items": [
        { "name": "React / Next.js", "icon": "SiReact", "color": "#61dafb", "category": "frontend", "is_primary": true },
        { "name": "TypeScript", "icon": "SiTypescript", "color": "#3178c6", "category": "frontend", "is_primary": true },
        { "name": "Tailwind CSS", "icon": "SiTailwindcss", "color": "#38bdf8", "category": "frontend", "is_primary": true },
        { "name": "Vue.js", "icon": "SiVuedotjs", "color": "#41b883", "category": "frontend" },
        { "name": "Node.js", "icon": "SiNodedotjs", "color": "#6cc24a", "category": "backend", "is_primary": true },
        { "name": "Python", "icon": "SiPython", "color": "#ffd343", "category": "backend" },
        { "name": "GraphQL", "icon": "SiGraphql", "color": "#e535ab", "category": "backend" },
        { "name": "Prisma", "icon": "SiPrisma", "color": "#5a67d8", "category": "backend" },
        { "name": "PostgreSQL", "icon": "SiPostgresql", "color": "#336791", "category": "db", "is_primary": true },
        { "name": "MongoDB", "icon": "SiMongodb", "color": "#47a248", "category": "db" },
        { "name": "Redis", "icon": "SiRedis", "color": "#dc382d", "category": "db" },
        { "name": "Docker", "icon": "SiDocker", "color": "#2496ed", "category": "db", "is_primary": true },
        { "name": "AWS", "icon": "AwsIcon", "color": "#ff9900", "category": "db" },
        { "name": "Supabase", "icon": "SiSupabase", "color": "#3ecf8e", "category": "db", "is_primary": true },
        { "name": "Figma", "icon": "SiFigma", "color": "#a259ff", "category": "design", "is_primary": true },
        { "name": "Git", "icon": "SiGit", "color": "#f05032", "category": "design" }
      ]
    },
    "projects": {
      "section_label": "Selected Work",
      "heading": "Featured Projects & Products",
      "items": [
        {
          "title": "Enterprise E-Commerce SaaS",
          "description": "Full-stack multi-tenant e-commerce platform built with Next.js App Router, Tailwind CSS, Supabase PostgreSQL, and Stripe integration.",
          "image": "/images/project-placeholder.svg",
          "tags": ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
          "category": "Full-Stack",
          "featured": true,
          "primaryLink": { "url": "https://example.com/projects/storefront" },
          "secondaryLink": { "url": "https://example.com/projects/storefront" }
        },
        {
          "title": "AI Content & Workspace Platform",
          "description": "Real-time AI document generation engine powered by Next.js, OpenAI API, WebSockets, and dynamic glassmorphism UI.",
          "image": "/images/project-placeholder.svg",
          "tags": ["React", "Node.js", "OpenAI", "WebSockets"],
          "category": "AI / Web",
          "featured": true,
          "primaryLink": { "url": "https://example.com/projects/workspace" },
          "secondaryLink": { "url": "https://example.com/projects/workspace" }
        },
        {
          "title": "Realtime Analytics Dashboard",
          "description": "Interactive analytics platform with real-time charting, live data streams, customized widgets, and dark mode aesthetic.",
          "image": "/images/project-placeholder.svg",
          "tags": ["TypeScript", "Recharts", "Tailwind CSS", "Supabase"],
          "category": "Dashboard",
          "featured": true,
          "primaryLink": { "url": "https://example.com/projects/analytics" },
          "secondaryLink": { "url": "https://example.com/projects/analytics" }
        }
      ]
    },
    "career": {
      "section_label": "Career Path",
      "heading": "Work Experience",
      "items": [
        {
          "role": "Senior Full-Stack Engineer",
          "company": "Example Company",
          "startDate": "2023",
          "endDate": "Present",
          "description": "Leading the core engineering team in developing high-throughput web applications using Next.js 15, TypeScript, and Supabase."
        },
        {
          "role": "Frontend Architect",
          "company": "Sample Studio",
          "startDate": "2021",
          "endDate": "2023",
          "description": "Designed and built interactive UI components, design systems, and responsive web apps using React, Tailwind CSS, and Framer Motion."
        }
      ]
    },
    "social": {
      "section_label": "Get In Touch",
      "heading": "Let’s Build Something Amazing Together",
      "subheading": "Feel free to reach out for collaborations or project inquiries.",
      "email": "hello@example.com",
      "available_badge": true,
      "availability_text": "Available for new projects",
      "email_copy_label": "Copy Email",
      "email_copied_label": "Copied!",
      "links": [
        { "platform": "GitHub", "url": "https://github.com/your-username", "color": "#fff", "icon": "SiGithub" },
        { "platform": "LinkedIn", "url": "https://linkedin.com/in/your-username", "color": "#0a66c2", "icon": "SiLinkedin" },
        { "platform": "X (Twitter)", "url": "https://x.com/your-username", "color": "#1da1f2", "icon": "SiX" },
        { "platform": "Discord", "url": "https://example.com/discord", "color": "#5865f2", "icon": "SiDiscord" }
      ]
    },
    "cv": { "en": "/cv/resume-en.pdf", "ar": "/cv/resume-ar.pdf" },
    "github": { "username": "" }
  },
  "ar": {
    "meta": {
      "title": "مطور تجريبي — مطور ويب",
      "description": "نموذج لمعرض أعمال مطور ويب يبني تطبيقات حديثة.",
      "favicon": "/favicon.ico"
    },
    "nav": {
      "logo": "مطور تجريبي",
      "logoSettings": {
        "colorType": "gradient",
        "gradientStart": "#7c5cfc",
        "gradientEnd": "#22d3ee",
        "logoType": "text",
        "animation": "gradient-flow"
      },
      "links": [
        { "label": "عني", "href": "#about" },
        { "label": "المهارات", "href": "#skills" },
        { "label": "المشاريع", "href": "#projects" },
        { "label": "الخبرة", "href": "#career" },
        { "label": "تواصل معي", "href": "#contact" }
      ]
    },
    "hero": {
      "greeting": "مرحباً، أنا",
      "name": "مطور تجريبي",
      "bio": "مهندس برمجيات وتطبيقات ويب متقدمة، متخصص في بناء أنظمة حديثة وسريعة باستخدام تقنيات React و Next.js و Node.js وتجارب تفاعلية مبهرة.",
      "cta_primary": "تصفح المشاريع",
      "cta_primary_href": "#projects",
      "cta_secondary": "عرض السيرة الذاتية",
      "cta_secondary_href": "/cv",
      "roles": ["مهندس برمجيات Full-Stack", "مطور تطبيقات Next.js & React", "متخصص تجربة وتصميم واجهات UI/UX", "معماري حلول سحابية"],
      "scroll_hint": "انزل للأسفل"
    },
    "about": {
      "section_label": "عن المهندس",
      "heading": "بناء أنظمة برمجية عالية الجودة وأداء فائق",
      "paragraphs": [
        "أنا مطور تجريبي أبني منتجات رقمية حديثة وموثوقة باستخدام تقنيات الويب.",
        "استبدل هذا النص التعريفي بمعلوماتك واهتماماتك وخبراتك."
      ],
      "stats": [
        { "label": "سنوات الخبرة", "value": "+X" },
        { "label": "مشاريع مكتملة", "value": "+X" },
        { "label": "عملاء سعداء", "value": "+X" }
      ]
    },
    "skills": {
      "section_label": "المهارات والتقنيات",
      "heading": "التقنيات التي أتقنها",
      "items": [
        { "name": "React / Next.js", "icon": "SiReact", "color": "#61dafb", "category": "frontend", "is_primary": true },
        { "name": "TypeScript", "icon": "SiTypescript", "color": "#3178c6", "category": "frontend", "is_primary": true },
        { "name": "Tailwind CSS", "icon": "SiTailwindcss", "color": "#38bdf8", "category": "frontend", "is_primary": true },
        { "name": "Vue.js", "icon": "SiVuedotjs", "color": "#41b883", "category": "frontend" },
        { "name": "Node.js", "icon": "SiNodedotjs", "color": "#6cc24a", "category": "backend", "is_primary": true },
        { "name": "Python", "icon": "SiPython", "color": "#ffd343", "category": "backend" },
        { "name": "GraphQL", "icon": "SiGraphql", "color": "#e535ab", "category": "backend" },
        { "name": "Prisma", "icon": "SiPrisma", "color": "#5a67d8", "category": "backend" },
        { "name": "PostgreSQL", "icon": "SiPostgresql", "color": "#336791", "category": "db", "is_primary": true },
        { "name": "MongoDB", "icon": "SiMongodb", "color": "#47a248", "category": "db" },
        { "name": "Redis", "icon": "SiRedis", "color": "#dc382d", "category": "db" },
        { "name": "Docker", "icon": "SiDocker", "color": "#2496ed", "category": "db", "is_primary": true },
        { "name": "AWS", "icon": "AwsIcon", "color": "#ff9900", "category": "db" },
        { "name": "Supabase", "icon": "SiSupabase", "color": "#3ecf8e", "category": "db", "is_primary": true },
        { "name": "Figma", "icon": "SiFigma", "color": "#a259ff", "category": "design", "is_primary": true },
        { "name": "Git", "icon": "SiGit", "color": "#f05032", "category": "design" }
      ]
    },
    "projects": {
      "section_label": "أعمال ممتازة",
      "heading": "أبرز المشاريع والتطبيقات",
      "items": [
        {
          "title": "منصة تجارة إلكترونية متكاملة SaaS",
          "description": "منصة متاجر متعددة التجار باستخدام Next.js App Router و Tailwind CSS و Supabase PostgreSQL وبوابة دفع Stripe.",
          "image": "/images/project-placeholder.svg",
          "tags": ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
          "category": "Full-Stack",
          "featured": true,
          "primaryLink": { "url": "https://example.com/projects/storefront" },
          "secondaryLink": { "url": "https://example.com/projects/storefront" }
        },
        {
          "title": "منصة الذكاء الاصطناعي وإنشاء المحتوى",
          "description": "تطبيق توليد المستندات والمحتوى بالذكاء الاصطناعي المباشر عبر OpenAI API وتفاعل لحظي WebSockets.",
          "image": "/images/project-placeholder.svg",
          "tags": ["React", "Node.js", "OpenAI", "WebSockets"],
          "category": "AI / Web",
          "featured": true,
          "primaryLink": { "url": "https://example.com/projects/workspace" },
          "secondaryLink": { "url": "https://example.com/projects/workspace" }
        },
        {
          "title": "لوحة تحليلات وإحصائيات لحظية",
          "description": "منصة تحليلات تفاعلية تعرض الرسوم البيانية المباشرة والبيانات مع دعم كامل للتصميم الليلي العادي والزجاجي.",
          "image": "/images/project-placeholder.svg",
          "tags": ["TypeScript", "Recharts", "Tailwind CSS", "Supabase"],
          "category": "Dashboard",
          "featured": true,
          "primaryLink": { "url": "https://example.com/projects/analytics" },
          "secondaryLink": { "url": "https://example.com/projects/analytics" }
        }
      ]
    },
    "career": {
      "section_label": "المسيرة المهنية",
      "heading": "الخبرات العملية",
      "items": [
        {
          "role": "كبير مهندسي البرمجيات Full-Stack",
          "company": "شركة نموذجية",
          "startDate": "2023",
          "endDate": "الحاضر",
          "description": "قيادة الفريق البرمجي في تطوير تطبيقات الويب الحديثة باستعمال Next.js 15 و TypeScript و Supabase."
        },
        {
          "role": "مطور واجهات ومصمم نظم UI/UX",
          "company": "استوديو تجريبي",
          "startDate": "2021",
          "endDate": "2023",
          "description": "تطوير وبناء الواجهات التفاعلية وأنظمة التصميم باستعمال React و Tailwind CSS و Framer Motion."
        }
      ]
    },
    "social": {
      "section_label": "تواصل معي",
      "heading": "لنعمل معاً على إنجاز مشروعك القادم",
      "subheading": "لا تتردد في التواصل معي لأي استفسار أو لطلب مشروع جديد.",
      "email": "hello@example.com",
      "available_badge": true,
      "availability_text": "متاح لاستقبال مشاريع جديدة",
      "email_copy_label": "نسخ البريد",
      "email_copied_label": "تم النسخ!",
      "links": [
        { "platform": "GitHub", "url": "https://github.com/your-username", "color": "#fff", "icon": "SiGithub" },
        { "platform": "LinkedIn", "url": "https://linkedin.com/in/your-username", "color": "#0a66c2", "icon": "SiLinkedin" },
        { "platform": "X (Twitter)", "url": "https://x.com/your-username", "color": "#1da1f2", "icon": "SiX" },
        { "platform": "Discord", "url": "https://example.com/discord", "color": "#5865f2", "icon": "SiDiscord" }
      ]
    },
    "cv": { "en": "/cv/resume-en.pdf", "ar": "/cv/resume-ar.pdf" },
    "github": { "username": "" }
  }
}'::jsonb);

-- 4. INSERT INTO RELATIONAL TABLES FOR FULL BACKWARD COMPATIBILITY
INSERT INTO site_settings (id, lang, cv_url, github_username, meta_title, meta_description, nav_json, footer_json)
VALUES 
(1, 'en', '/cv/resume-en.pdf', '', 'Sample Developer — Full-Stack Developer', 'A sample full-stack developer portfolio.', '{}'::jsonb, '{}'::jsonb),
(2, 'ar', '/cv/resume-ar.pdf', '', 'مطور تجريبي — مطور ويب', 'نموذج لمعرض أعمال مطور ويب.', '{}'::jsonb, '{}'::jsonb);

INSERT INTO hero_section (id, lang, greeting, name, bio, cta_primary, cta_primary_href, cta_secondary, cta_secondary_href, roles, scroll_hint)
VALUES
(1, 'en', 'Hello, I am', 'Sample Developer', 'A sample full-stack developer building modern web applications.', 'Explore Projects', '#projects', 'Get In Touch', '#contact', ARRAY['Full-Stack Developer', 'Next.js Developer', 'UI/UX Enthusiast'], 'Scroll down'),
(2, 'ar', 'مرحباً، أنا', 'مطور تجريبي', 'مطور تجريبي يبني تطبيقات ويب حديثة.', 'تصفح المشاريع', '#projects', 'تواصل معي', '#contact', ARRAY['مطور Full-Stack', 'مطور Next.js', 'مهتم بتجربة المستخدم'], 'انزل للأسفل');

INSERT INTO about_section (id, lang, section_label, heading, paragraphs)
VALUES
(1, 'en', 'About Me', 'Building Modern Web Experiences', ARRAY['I am a sample developer exploring modern web technologies...', 'Replace this text with your own background and interests.']),
(2, 'ar', 'عني', 'بناء تجارب ويب حديثة', ARRAY['أنا مطور تجريبي أستكشف تقنيات الويب الحديثة...', 'استبدل هذا النص بمعلوماتك واهتماماتك.']);

INSERT INTO about_stats (lang, label, value, sort_order) VALUES
('en', 'Years Experience', 'X+', 0),
('en', 'Completed Projects', 'X+', 1),
('en', 'Satisfied Clients', 'X+', 2),
('ar', 'سنوات الخبرة', '+X', 0),
('ar', 'مشاريع مكتملة', '+X', 1),
('ar', 'عملاء سعداء', '+X', 2);

INSERT INTO skills_section (id, lang, section_label, heading) VALUES
(1, 'en', 'Skills & Technologies', 'Technologies I Master'),
(2, 'ar', 'المهارات والتقنيات', 'التقنيات التي أتقنها');

INSERT INTO skills (lang, name, icon, level, category, color, is_primary, sort_order) VALUES
('en', 'React / Next.js', 'SiReact', 95, 'frontend', '#61dafb', true, 0),
('en', 'TypeScript', 'SiTypescript', 90, 'frontend', '#3178c6', true, 1),
('en', 'Tailwind CSS', 'SiTailwindcss', 95, 'frontend', '#38bdf8', true, 2),
('en', 'Node.js', 'SiNodedotjs', 90, 'backend', '#6cc24a', true, 3),
('en', 'PostgreSQL', 'SiPostgresql', 85, 'db', '#336791', true, 4),
('en', 'Supabase', 'SiSupabase', 90, 'db', '#3ecf8e', true, 5),
('en', 'Figma', 'SiFigma', 85, 'design', '#a259ff', true, 6),
('ar', 'React / Next.js', 'SiReact', 95, 'frontend', '#61dafb', true, 0),
('ar', 'TypeScript', 'SiTypescript', 90, 'frontend', '#3178c6', true, 1),
('ar', 'Tailwind CSS', 'SiTailwindcss', 95, 'frontend', '#38bdf8', true, 2),
('ar', 'Node.js', 'SiNodedotjs', 90, 'backend', '#6cc24a', true, 3),
('ar', 'PostgreSQL', 'SiPostgresql', 85, 'db', '#336791', true, 4),
('ar', 'Supabase', 'SiSupabase', 90, 'db', '#3ecf8e', true, 5),
('ar', 'Figma', 'SiFigma', 85, 'design', '#a259ff', true, 6);

INSERT INTO projects_section (id, lang, section_label, heading) VALUES
(1, 'en', 'Selected Work', 'Featured Projects & Products'),
(2, 'ar', 'أعمال ممتازة', 'أبرز المشاريع والتطبيقات');

INSERT INTO projects (lang, title, description, image, tags, category, featured, primary_link_url, secondary_link_url, sort_order) VALUES
('en', 'Sample E-Commerce Store', 'A sample e-commerce website built with Next.js, TypeScript, and Supabase.', '/images/project-placeholder.svg', ARRAY['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS'], 'Full-Stack', true, 'https://example.com/projects/storefront', 'https://example.com/projects/storefront', 0),
('en', 'Sample Content Workspace', 'A sample content workspace built with React, Node.js, and real-time updates.', '/images/project-placeholder.svg', ARRAY['React', 'Node.js', 'WebSockets'], 'Web App', true, 'https://example.com/projects/workspace', 'https://example.com/projects/workspace', 1),
('en', 'Sample Analytics Dashboard', 'A sample dashboard with interactive charts and responsive layouts.', '/images/project-placeholder.svg', ARRAY['TypeScript', 'Recharts', 'Tailwind CSS'], 'Dashboard', true, 'https://example.com/projects/analytics', 'https://example.com/projects/analytics', 2),
('ar', 'متجر إلكتروني تجريبي', 'متجر إلكتروني نموذجي مبني باستخدام Next.js وTypeScript وSupabase.', '/images/project-placeholder.svg', ARRAY['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS'], 'Full-Stack', true, 'https://example.com/projects/storefront', 'https://example.com/projects/storefront', 0),
('ar', 'منصة محتوى تجريبية', 'منصة محتوى نموذجية مبنية باستخدام React وNode.js والتحديثات المباشرة.', '/images/project-placeholder.svg', ARRAY['React', 'Node.js', 'WebSockets'], 'Web App', true, 'https://example.com/projects/workspace', 'https://example.com/projects/workspace', 1),
('ar', 'لوحة تحليلات تجريبية', 'لوحة نموذجية بمخططات تفاعلية وتصميم متجاوب.', '/images/project-placeholder.svg', ARRAY['TypeScript', 'Recharts', 'Tailwind CSS'], 'Dashboard', true, 'https://example.com/projects/analytics', 'https://example.com/projects/analytics', 2);

INSERT INTO career_section (id, lang, section_label, heading) VALUES
(1, 'en', 'Career Path', 'Work Experience'),
(2, 'ar', 'المسيرة المهنية', 'الخبرات العملية');

INSERT INTO career_items (lang, role, company, start_date, end_date, description, sort_order) VALUES
('en', 'Full-Stack Developer', 'Example Company', '20XX', 'Present', 'Sample experience entry. Replace it with your own work history.', 0),
('ar', 'مطور Full-Stack', 'شركة نموذجية', '20XX', 'الحاضر', 'خبرة عملية نموذجية. استبدلها بخبراتك المهنية.', 0);

INSERT INTO social_links (platform, url, color, icon, sort_order) VALUES
('GitHub', 'https://github.com/your-username', '#fff', 'SiGithub', 0),
('LinkedIn', 'https://linkedin.com/in/your-username', '#0a66c2', 'SiLinkedin', 1),
('X (Twitter)', 'https://x.com/your-username', '#1da1f2', 'SiX', 2),
('Discord', 'https://example.com/discord', '#5865f2', 'SiDiscord', 3);
