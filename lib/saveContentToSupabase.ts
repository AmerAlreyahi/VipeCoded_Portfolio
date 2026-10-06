import { createClient } from '@/utils/supabase/server'
import { syncContentData, type ContentJSON } from '@/lib/getContentFromSupabase'

export async function saveContentToSupabase(content: ContentJSON): Promise<boolean> {
  const supabase = await createClient()

  try {
    // 0. Automatically sync projects, skills, social links, logo & settings between EN and AR
    content = syncContentData(content)

    // 1. Save master JSON object to Supabase site_content table
    try {
      await supabase.from('site_content').upsert({
        id: 'main',
        content,
        updated_at: new Date().toISOString()
      })
    } catch (err) {
      console.warn('Master site_content upsert notice:', err)
    }

    // 2. Upsert into relational tables for backward compatibility
    const langs = ['en', 'ar'] as const
    
    // Clear array tables concurrently to replace them fresh
    await Promise.all([
      supabase.from('about_stats').delete().neq('lang', 'none'),
      supabase.from('skills').delete().neq('lang', 'none'),
      supabase.from('projects').delete().neq('lang', 'none'),
      supabase.from('career_items').delete().neq('lang', 'none'),
      supabase.from('social_links').delete().neq('platform', 'none'),
    ])
    
    const dbPromises: any[] = []

    for (const lang of langs) {
      const data = content[lang]
      if (!data) continue
      
      const id = lang === 'en' ? 1 : 2

      // site_settings
      dbPromises.push(supabase.from('site_settings').upsert({
        id,
        lang,
        cv_url: content.en.cv?.[lang] || '',
        github_username: content.en.github?.username || '',
        meta_title: data.meta?.title || '',
        meta_description: data.meta?.description || '',
        favicon: data.meta?.favicon || '',
        email: data.social?.email || 'admin@portfolio',
        available_badge: data.social?.available_badge ?? true,
        availability_text: data.social?.availability_text || 'Available for work',
        nav_json: data.nav || {},
        footer_json: data.footer || {}
      }))

      // hero_section
      dbPromises.push(supabase.from('hero_section').upsert({
        id,
        lang,
        greeting: data.hero?.greeting || '',
        name: data.hero?.name || '',
        bio: data.hero?.bio || '',
        avatar: (data.hero as any)?.avatar || (data.hero as any)?.image || '',
        image: (data.hero as any)?.image || (data.hero as any)?.avatar || '',
        cta_primary: data.hero?.cta_primary || '',
        cta_primary_href: data.hero?.cta_primary_href || '',
        cta_secondary: data.hero?.cta_secondary || '',
        cta_secondary_href: data.hero?.cta_secondary_href || '',
        roles: data.hero?.roles || [],
        scroll_hint: data.hero?.scroll_hint || ''
      }))

      // about_section
      dbPromises.push(supabase.from('about_section').upsert({
        id,
        lang,
        section_label: data.about?.section_label || '',
        heading: data.about?.heading || '',
        paragraphs: data.about?.paragraphs || []
      }))

      // about_stats
      if (data.about?.stats && data.about.stats.length > 0) {
        const statsRows = data.about.stats.map((st, i) => ({
          lang,
          label: st.label,
          value: String(st.value),
          sort_order: i
        }))
        dbPromises.push(supabase.from('about_stats').insert(statsRows))
      }

      // skills_section
      dbPromises.push(supabase.from('skills_section').upsert({
        id,
        lang,
        section_label: data.skills?.section_label || '',
        heading: data.skills?.heading || ''
      }))

      // skills
      if (data.skills?.items && data.skills.items.length > 0) {
        const skillsRows = data.skills.items.map((sk, i) => ({
          lang,
          name: sk.name,
          icon: sk.icon,
          level: sk.level || 0,
          category: sk.category || 'frontend',
          color: sk.color || '#61dafb',
          is_primary: Boolean(sk.is_primary),
          sort_order: i
        }))
        dbPromises.push(supabase.from('skills').insert(skillsRows))
      }

      // projects_section
      dbPromises.push(supabase.from('projects_section').upsert({
        id,
        lang,
        section_label: data.projects?.section_label || '',
        heading: data.projects?.heading || ''
      }))

      // projects
      if (data.projects?.items && data.projects.items.length > 0) {
        const projectRows = data.projects.items.map((prj, i) => ({
          lang,
          title: prj.title,
          description: prj.description,
          image: prj.image || '',
          tags: prj.tags || [],
          category: prj.category || '',
          featured: prj.featured || false,
          primary_link_url: prj.primaryLink?.url || '',
          secondary_link_url: prj.secondaryLink?.url || '',
          sort_order: i
        }))
        dbPromises.push(supabase.from('projects').insert(projectRows))
      }

      // career_section
      dbPromises.push(supabase.from('career_section').upsert({
        id,
        lang,
        section_label: data.career?.section_label || '',
        heading: data.career?.heading || ''
      }))

      // career_items
      if (data.career?.items && data.career.items.length > 0) {
        const careerRows = data.career.items.map((ci, i) => ({
          lang,
          role: ci.role,
          company: ci.company,
          start_date: ci.startDate,
          end_date: ci.endDate,
          description: ci.description || '',
          sort_order: i
        }))
        dbPromises.push(supabase.from('career_items').insert(careerRows))
      }
    }
    
    // social_links (language agnostic, using EN)
    if (content.en.social?.links && content.en.social.links.length > 0) {
      const socialRows = content.en.social.links.map((sl, i) => ({
        platform: sl.platform,
        url: sl.url,
        color: sl.color || '',
        icon: sl.icon || '',
        sort_order: i
      }))
      dbPromises.push(supabase.from('social_links').insert(socialRows))
    }
    
    // Execute all database operations concurrently
    await Promise.all(dbPromises)
    
    return true
  } catch (err) {
    console.error('Failed to save content:', err)
    return false
  }
}
