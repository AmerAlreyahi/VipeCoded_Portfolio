import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { demoContent } from '@/lib/demoContent'
import { cache } from 'react'

// Mirror of the original JSON structure
export interface HeroContent {
  greeting: string; name: string; bio: string;
  cta_primary: string; cta_primary_href: string;
  cta_secondary: string; cta_secondary_href: string;
  roles: string[]; scroll_hint: string;
  avatar?: string; image?: string;
}
export interface AboutContent {
  section_label: string; heading: string;
  paragraphs: string[];
  stats: Array<{ label: string; value: string | number }>;
}
export interface SkillItem { name: string; icon: string; level?: number; category?: string; color?: string; is_primary?: boolean }
export interface SkillsContent { section_label: string; heading: string; items: SkillItem[] }
export interface ProjectItem {
  title: string; description: string; image: string;
  tags: string[]; category: string; featured: boolean;
  primaryLink: { url: string }; secondaryLink: { url: string }
}
export interface ProjectsContent {
  section_label: string; heading: string; items: ProjectItem[]
  back_home?: string; all_heading?: string; coming_soon?: string; view_all?: string
}
export interface CareerItem {
  role: string; company: string; startDate: string; endDate: string; description: string
}
export interface CareerContent { section_label: string; heading: string; items: CareerItem[] }
export interface SocialLink { platform: string; url: string; color: string; icon: string }
export interface SocialContent {
  section_label?: string;
  heading?: string;
  subheading?: string;
  email?: string;
  available_badge?: boolean;
  availability_text?: string;
  email_copy_label?: string;
  email_copied_label?: string;
  links: SocialLink[];
}
export interface CVContent { en: string; ar: string }
export interface GitHubSettings { username: string; token?: string }

export interface NavLogoSettings {
  colorType?: 'gradient' | 'solid'
  gradientStart?: string
  gradientEnd?: string
  solidColor?: string
  glowColor?: string
  logoImage?: string
  logoType?: 'text' | 'image'
  animation?: 'none' | 'gradient-flow' | 'glow-pulse' | 'shimmer' | 'bounce' | 'neon-flicker'
}

export interface NavContent {
  logo?: string
  logoSettings?: NavLogoSettings
  links?: Array<{ label: string; href: string }>
}

export interface FooterContent {
  copyright?: string
  back_to_top?: string
  tagline?: string
}

export interface LangContent {
  meta: Record<string, string>;
  nav: NavContent;
  hero: HeroContent;
  about: AboutContent;
  skills: SkillsContent;
  projects: ProjectsContent;
  career: CareerContent;
  social: SocialContent;
  footer: FooterContent;
  cv: CVContent;
  github?: GitHubSettings;
}

export interface ContentJSON { en: LangContent; ar: LangContent }

export function syncContentData(content: ContentJSON): ContentJSON {
  if (!content || !content.en || !content.ar) return content

  const en = content.en
  const ar = content.ar

  // 1. Sync Hero Avatar / Profile Image (same person = same photo)
  const enAvatar = en.hero?.avatar || en.hero?.image || ''
  const arAvatar = ar.hero?.avatar || ar.hero?.image || ''
  const sharedAvatar = enAvatar || arAvatar
  if (sharedAvatar) {
    if (en.hero) { en.hero.avatar = sharedAvatar; en.hero.image = sharedAvatar }
    if (ar.hero) { ar.hero.avatar = sharedAvatar; ar.hero.image = sharedAvatar }
  }

  // 2. Sync Social Links & email & badge
  if (en.social?.links && Array.isArray(en.social.links)) {
    if (!ar.social) ar.social = { links: [] }
    ar.social.links = JSON.parse(JSON.stringify(en.social.links))
    ar.social.email = en.social.email || ar.social.email
    ar.social.available_badge = en.social.available_badge ?? ar.social.available_badge ?? true
    if (en.social.availability_text) {
      ar.social.availability_text = ar.social.availability_text || en.social.availability_text
    }
  }

  // 2. Sync Projects (ensure ar has all projects that en has, and vice versa)
  if (en.projects?.items && ar.projects?.items) {
    const maxLen = Math.max(en.projects.items.length, ar.projects.items.length)
    for (let i = 0; i < maxLen; i++) {
      let enPrj = en.projects.items[i]
      let arPrj = ar.projects.items[i]

      if (!enPrj && arPrj) {
        enPrj = JSON.parse(JSON.stringify(arPrj))
        en.projects.items[i] = enPrj
      }
      if (!arPrj && enPrj) {
        arPrj = JSON.parse(JSON.stringify(enPrj))
        ar.projects.items[i] = arPrj
      }

      if (enPrj && arPrj) {
        arPrj.image = enPrj.image || arPrj.image
        enPrj.image = arPrj.image || enPrj.image
        arPrj.category = enPrj.category || arPrj.category
        arPrj.featured = Boolean(enPrj.featured)
        enPrj.featured = Boolean(arPrj.featured)
        arPrj.tags = enPrj.tags || arPrj.tags
        arPrj.primaryLink = enPrj.primaryLink || arPrj.primaryLink
        arPrj.secondaryLink = enPrj.secondaryLink || arPrj.secondaryLink
      }
    }
  }

  // 3. Sync Skills
  if (en.skills?.items && ar.skills?.items) {
    const maxLen = Math.max(en.skills.items.length, ar.skills.items.length)
    for (let i = 0; i < maxLen; i++) {
      let enSk = en.skills.items[i]
      let arSk = ar.skills.items[i]

      if (!enSk && arSk) {
        enSk = JSON.parse(JSON.stringify(arSk))
        en.skills.items[i] = enSk
      }
      if (!arSk && enSk) {
        arSk = JSON.parse(JSON.stringify(enSk))
        ar.skills.items[i] = arSk
      }

      if (enSk && arSk) {
        arSk.name = enSk.name || arSk.name
        arSk.icon = enSk.icon || arSk.icon
        arSk.level = enSk.level || arSk.level
        arSk.color = enSk.color || arSk.color
        arSk.category = enSk.category || arSk.category
        arSk.is_primary = Boolean(enSk.is_primary)
        enSk.is_primary = Boolean(arSk.is_primary)
      }
    }
  }

  // 4. Sync Career Items
  if (en.career?.items && ar.career?.items) {
    const maxLen = Math.max(en.career.items.length, ar.career.items.length)
    for (let i = 0; i < maxLen; i++) {
      let enCi = en.career.items[i]
      let arCi = ar.career.items[i]

      if (!enCi && arCi) {
        enCi = JSON.parse(JSON.stringify(arCi))
        en.career.items[i] = enCi
      }
      if (!arCi && enCi) {
        arCi = JSON.parse(JSON.stringify(enCi))
        ar.career.items[i] = arCi
      }

      if (enCi && arCi) {
        arCi.company = enCi.company || arCi.company
        arCi.startDate = enCi.startDate || arCi.startDate
        arCi.endDate = enCi.endDate || arCi.endDate
      }
    }
  }

  // 5. Sync Nav Logo & LogoSettings
  if (en.nav?.logoSettings) {
    if (!ar.nav) ar.nav = {}
    ar.nav.logoSettings = { ...en.nav.logoSettings }
  }

  // 6. Sync GitHub settings. This JSON is publicly readable, so never keep a token in it
  // (also scrubs tokens saved by older versions of the admin panel). Use GITHUB_TOKEN env instead.
  for (const lang of [en, ar]) {
    if (lang.github && 'token' in lang.github) delete lang.github.token
  }
  if (en.github) {
    ar.github = { ...en.github }
  }

  // 7. Sync CV
  if (en.cv) {
    ar.cv = { ...en.cv }
  }

  return content
}

function hasSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url || !key || url.includes('your-project-id')) {
    return false
  }

  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'https:' || parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1'
  } catch {
    return false
  }
}

export const CONTENT_CACHE_TAG = 'site-content'
export const CONTENT_REVALIDATE_SECONDS = 60

// Public content is readable with the publishable key (RLS: public SELECT), so no user session
// or cookies are needed. That keeps the public pages statically cacheable (ISR) instead of
// rendering on every request. Pass `fresh` for admin read-modify-write flows to bypass the cache.
function createPublicClient(fresh: boolean) {
  return createSupabaseClient(process.env.SUPABASE_URL!.trim(), process.env.SUPABASE_PUBLISHABLE_KEY!.trim(), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, fresh
          ? { ...init, cache: 'no-store' }
          : { ...init, next: { revalidate: CONTENT_REVALIDATE_SECONDS, tags: [CONTENT_CACHE_TAG] } }),
    },
  })
}

export const getContentFromSupabase = cache(async (fresh: boolean = false): Promise<ContentJSON | null> => {
  if (!hasSupabaseConfig()) {
    if (process.env.NODE_ENV === 'development') return demoContent
    console.error('Supabase is not configured; portfolio content is unavailable.')
    return null
  }

  try {
    const supabase = createPublicClient(fresh)

    // 1. Try to read from master site_content table first for 100% full fidelity
    const { data: masterRow } = await supabase.from('site_content').select('content').eq('id', 'main').maybeSingle()
    if (masterRow?.content && typeof masterRow.content === 'object' && masterRow.content.en) {
      return syncContentData(masterRow.content as ContentJSON)
    }

    // 2. Fallback to relational tables read
    const relationalResults = await Promise.all([
      supabase.from('site_settings').select('*'),
      supabase.from('hero_section').select('*'),
      supabase.from('about_section').select('*'),
      supabase.from('about_stats').select('*').order('sort_order'),
      supabase.from('skills_section').select('*'),
      supabase.from('skills').select('*').order('sort_order'),
      supabase.from('projects_section').select('*'),
      supabase.from('projects').select('*').order('sort_order'),
      supabase.from('career_section').select('*'),
      supabase.from('career_items').select('*').order('sort_order'),
      supabase.from('social_links').select('*').order('sort_order')
    ])
    const failedQuery = relationalResults.find(({ error }) => error)
    if (failedQuery?.error) throw failedQuery.error

    const [
      { data: site_settings },
      { data: hero_section },
      { data: about_section },
      { data: about_stats },
      { data: skills_section },
      { data: skills },
      { data: projects_section },
      { data: projects },
      { data: career_section },
      { data: career_items },
      { data: social_links }
    ] = relationalResults

    const result: Partial<ContentJSON> = { en: {} as LangContent, ar: {} as LangContent }
    const langs = ['en', 'ar'] as const

    for (const lang of langs) {
      const ss = site_settings?.find(r => r.lang === lang)
      const hs = hero_section?.find(r => r.lang === lang)
      const as = about_section?.find(r => r.lang === lang)
      const sks = skills_section?.find(r => r.lang === lang)
      const ps = projects_section?.find(r => r.lang === lang)
      const cs = career_section?.find(r => r.lang === lang)

      const cv_en = site_settings?.find(r => r.lang === 'en')?.cv_url || ''
      const cv_ar = site_settings?.find(r => r.lang === 'ar')?.cv_url || ''

      result[lang] = {
        meta: {
          title: ss?.meta_title || (lang === 'en' ? 'Your Name — Portfolio' : 'اسمك — الموقع الشخصي'),
          description: ss?.meta_description || '',
          favicon: ss?.favicon || ss?.site_logo || '',
          lang: lang,
          dir: lang === 'en' ? 'ltr' : 'rtl'
        },
        nav: (ss?.nav_json && Object.keys(ss.nav_json).length > 0 && Array.isArray(ss.nav_json.links))
          ? ss.nav_json
          : {
              logo: lang === 'en' ? 'Your Name.' : 'اسمك.',
              logoSettings: {
                colorType: 'gradient',
                gradientStart: '#7c5cfc',
                gradientEnd: '#22d3ee',
                solidColor: '#7c5cfc',
                glowColor: '#7c5cfc',
                animation: 'gradient-flow'
              },
              links: [
                { label: lang === 'en' ? 'Home' : 'الرئيسية', href: '#hero' },
                { label: lang === 'en' ? 'About' : 'عني', href: '#about' },
                { label: lang === 'en' ? 'Skills' : 'المهارات', href: '#skills' },
                { label: lang === 'en' ? 'Projects' : 'المشاريع', href: '#projects' },
                { label: lang === 'en' ? 'Career' : 'الخبرات', href: '#career' },
                { label: lang === 'en' ? 'Contact' : 'تواصل معي', href: '#contact' }
              ]
            },
        footer: (ss?.footer_json && Object.keys(ss.footer_json).length > 0)
          ? ss.footer_json
          : {
              copyright: lang === 'en' ? '© 2026 Your Name. All rights reserved.' : '© 2026 اسمك. جميع الحقوق محفوظة.',
              back_to_top: lang === 'en' ? 'Back to top' : 'الرجوع للأعلى'
            },
        cv: {
          en: cv_en,
          ar: cv_ar
        },
        github: {
          username: ss?.github_username || ''
        },
        hero: {
          greeting: hs?.greeting || '',
          name: hs?.name || '',
          bio: hs?.bio || '',
          cta_primary: hs?.cta_primary || '',
          cta_primary_href: hs?.cta_primary_href || '',
          cta_secondary: hs?.cta_secondary || '',
          cta_secondary_href: hs?.cta_secondary_href || '',
          roles: hs?.roles || [],
          scroll_hint: hs?.scroll_hint || '',
          avatar: hs?.avatar || hs?.image || '',
          image: hs?.image || hs?.avatar || ''
        },
        about: {
          section_label: as?.section_label || '',
          heading: as?.heading || '',
          paragraphs: as?.paragraphs || [],
          stats: (about_stats || []).filter(r => r.lang === lang).map(st => ({
            label: st.label,
            value: st.value
          }))
        },
        skills: {
          section_label: sks?.section_label || '',
          heading: sks?.heading || '',
          items: (skills || []).filter(r => r.lang === lang).map(sk => ({
            name: sk.name,
            icon: sk.icon,
            level: sk.level,
            category: sk.category || 'frontend',
            color: sk.color || '#61dafb',
            is_primary: Boolean(sk.is_primary)
          }))
        },
        projects: {
          section_label: ps?.section_label || '',
          heading: ps?.heading || '',
          items: (projects || []).filter(r => r.lang === lang).map(p => ({
            title: p.title,
            description: p.description,
            image: p.image,
            tags: p.tags,
            category: p.category,
            featured: p.featured,
            primaryLink: { url: p.primary_link_url },
            secondaryLink: { url: p.secondary_link_url }
          }))
        },
        career: {
          section_label: cs?.section_label || '',
          heading: cs?.heading || '',
          items: (career_items || []).filter(r => r.lang === lang).map(ci => ({
            role: ci.role,
            company: ci.company,
            startDate: ci.start_date,
            endDate: ci.end_date,
            description: ci.description
          }))
        },
        social: {
          section_label: lang === 'en' ? 'Get In Touch' : 'تواصل معي',
          heading: lang === 'en' ? 'Let’s Build Something Amazing Together' : 'لنعمل معاً على إنجاز مشروعك القادم',
          subheading: lang === 'en' ? 'Feel free to reach out for collaborations or just a friendly chat.' : 'تواصل معي لأي استفسار أو لطلب مشروع جديد.',
          email: ss?.email || '',
          available_badge: ss?.available_badge ?? true,
          availability_text: ss?.availability_text || (lang === 'en' ? 'Available for work' : 'متاح للعمل'),
          email_copy_label: lang === 'en' ? 'Copy Email' : 'نسخ البريد',
          email_copied_label: lang === 'en' ? 'Copied!' : 'تم النسخ!',
          links: (social_links || []).map(sl => ({
            platform: sl.platform,
            url: sl.url,
            color: sl.color,
            icon: sl.icon
          }))
        }
      } as LangContent
    }


    return syncContentData(result as ContentJSON)
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Unable to load Supabase content; using generic local preview data.', err)
      return demoContent
    }
    console.error('Error fetching content from Supabase:', err)
    return null
  }
})
