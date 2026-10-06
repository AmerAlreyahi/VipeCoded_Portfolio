-- Apply this to an existing Supabase project to restrict database and Storage
-- writes to explicitly allowlisted administrator email addresses.

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

DO $$
DECLARE
  table_name TEXT;
  policy_name TEXT;
  table_names TEXT[] := ARRAY[
    'site_content', 'site_settings', 'hero_section', 'about_section',
    'about_stats', 'skills_section', 'skills', 'projects_section',
    'projects', 'career_section', 'career_items', 'social_links'
  ];
BEGIN
  FOREACH table_name IN ARRAY table_names LOOP
    FOREACH policy_name IN ARRAY ARRAY[
      'Allow authenticated full access on ',
      'Admin Write ',
      'Portfolio admins write '
    ] LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name || table_name, table_name);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin())',
      'Portfolio admins write ' || table_name,
      table_name
    );
  END LOOP;
END;
$$;

DROP POLICY IF EXISTS "Public Read Portfolio Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Portfolio Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Portfolio Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Portfolio Storage" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio admins insert Storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio admins update Storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio admins delete Storage objects" ON storage.objects;

CREATE POLICY "Public Read Portfolio Storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "Portfolio admins insert Storage objects" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio' AND public.is_portfolio_admin());
CREATE POLICY "Portfolio admins update Storage objects" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_portfolio_admin())
  WITH CHECK (bucket_id = 'portfolio' AND public.is_portfolio_admin());
CREATE POLICY "Portfolio admins delete Storage objects" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'portfolio' AND public.is_portfolio_admin());
