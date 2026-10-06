'use client'

import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import * as SiIcons from 'react-icons/si'
import * as FaIcons from 'react-icons/fa6'
import * as TbIcons from 'react-icons/tb'
import * as BiIcons from 'react-icons/bi'
import * as RxIcons from 'react-icons/rx'
import * as LuIcons from 'react-icons/lu'
import * as MdIcons from 'react-icons/md'
import { useContent } from '@/hooks/useContent'
import { useLanguage } from '@/context/LanguageContext'
import type { SkillItem } from '@/lib/getContentFromSupabase'

/* ── AwsIcon: inline SVG since react-icons v5 dropped SiAmazonwebservices ── */
function AwsIcon({ size = 16, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style} aria-hidden="true">
      <path d="M7.17 8.82a4.47 4.47 0 000 .87c.04.22.11.45.22.7.07.14.1.28.1.38 0 .16-.08.33-.27.5l-.88.59a.59.59 0 01-.33.11c-.13 0-.26-.06-.39-.18a3.9 3.9 0 01-.46-.61 9.8 9.8 0 01-.4-.76C3.62 11.52 2.5 12.1 1.16 12.1c-1.04 0-1.88-.3-2.5-.9-.62-.6-.94-1.4-.94-2.4 0-1.07.38-1.93 1.15-2.58.77-.65 1.79-.98 3.08-.98.43 0 .87.04 1.33.1.47.06.94.16 1.43.27V4.8c0-.94-.2-1.6-.59-1.99-.4-.38-1.07-.57-2.03-.57-.44 0-.88.05-1.34.17-.47.12-.92.27-1.35.46-.2.09-.35.14-.44.17a.77.77 0 01-.19.03c-.17 0-.25-.13-.25-.39v-.61c0-.2.02-.36.07-.44a.79.79 0 01.3-.22c.43-.22.96-.41 1.57-.55.6-.14 1.25-.22 1.93-.22 1.51 0 2.62.34 3.32 1.03.69.68 1.05 1.72 1.05 3.12v4.1zm-5.1 1.9c.41 0 .84-.07 1.29-.22.45-.15.85-.42 1.19-.79.2-.24.35-.5.42-.79.07-.28.11-.62.11-1.02v-.49a10.6 10.6 0 00-1.15-.22 9.4 9.4 0 00-1.18-.07c-.84 0-1.45.17-1.87.51-.42.35-.62.83-.62 1.46 0 .59.15 1.04.45 1.35.3.31.73.48 1.28.48h.08z"/>
    </svg>
  )
}

/* ── Fallback icon for unknown icon names ─────────────── */
function FallbackIcon({ size = 16, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor">?</text>
    </svg>
  )
}

/* ── Icon Component supporting Si, Fa, Tb, Bi icons dynamically ── */
export function DynamicIcon({ name, size = 16, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  if (!name) return <FallbackIcon size={size} style={style} />
  if (name === 'AwsIcon') return <AwsIcon size={size} style={style} />

  // Clean name if user pasted `<FaDesktop />` or `fa/FaDesktop` or extra spaces
  const cleanName = name.replace(/<|>|\/|\s|import|from|react-icons/gi, '').trim()

  let IconComponent: React.ComponentType<{ size?: number; style?: React.CSSProperties }> | undefined

  if (cleanName.startsWith('Si')) {
    IconComponent = (SiIcons as Record<string, any>)[cleanName]
  } else if (cleanName.startsWith('Fa')) {
    IconComponent = (FaIcons as Record<string, any>)[cleanName]
  } else if (cleanName.startsWith('Tb')) {
    IconComponent = (TbIcons as Record<string, any>)[cleanName]
  } else if (cleanName.startsWith('Bi')) {
    IconComponent = (BiIcons as Record<string, any>)[cleanName]
  } else if (cleanName.startsWith('Rx')) {
    IconComponent = (RxIcons as Record<string, any>)[cleanName]
  } else if (cleanName.startsWith('Lu')) {
    IconComponent = (LuIcons as Record<string, any>)[cleanName]
  } else if (cleanName.startsWith('Md')) {
    IconComponent = (MdIcons as Record<string, any>)[cleanName]
  }

  // Fallback search across all icon dictionaries
  if (!IconComponent) {
    IconComponent =
      (SiIcons as Record<string, any>)[cleanName] ||
      (FaIcons as Record<string, any>)[cleanName] ||
      (TbIcons as Record<string, any>)[cleanName] ||
      (BiIcons as Record<string, any>)[cleanName] ||
      (RxIcons as Record<string, any>)[cleanName] ||
      (LuIcons as Record<string, any>)[cleanName] ||
      (MdIcons as Record<string, any>)[cleanName]
  }

  if (IconComponent) {
    return <IconComponent size={size} style={style} />
  }

  return <FallbackIcon size={size} style={style} />
}

/* ── Category labels (bilingual) ────────────────────────── */
const CATEGORY_LABELS: Record<string, { en: string; ar: string }> = {
  frontend:  { en: 'Frontend',            ar: 'الواجهة الأمامية' },
  backend:   { en: 'Backend',             ar: 'الخادم' },
  db:        { en: 'Database & DevOps',   ar: 'قواعد البيانات والـ DevOps' },
  design:    { en: 'Design & Tools',      ar: 'التصميم والأدوات' },
  mobile:    { en: 'Mobile',              ar: 'تطبيقات الجوال' },
  testing:   { en: 'Testing',             ar: 'الاختبارات' },
  ai:        { en: 'AI & ML',             ar: 'الذكاء الاصطناعي' },
  other:     { en: 'Other',               ar: 'أخرى' },
}

/* Category sort order */
const CATEGORY_ORDER = ['frontend', 'backend', 'db', 'mobile', 'design', 'testing', 'ai', 'other']

/* ── Default/fallback skills (used when DB is empty) ────── */
const FALLBACK_SKILLS: SkillItem[] = [
  { name: 'React / Next.js', icon: 'SiReact',       color: '#61dafb', category: 'frontend', is_primary: true },
  { name: 'TypeScript',      icon: 'SiTypescript',  color: '#3178c6', category: 'frontend', is_primary: true },
  { name: 'Tailwind CSS',    icon: 'SiTailwindcss', color: '#38bdf8', category: 'frontend', is_primary: true },
  { name: 'Vue.js',          icon: 'SiVuedotjs',    color: '#41b883', category: 'frontend' },
  { name: 'Node.js',         icon: 'SiNodedotjs',   color: '#6cc24a', category: 'backend', is_primary: true },
  { name: 'Python',          icon: 'SiPython',      color: '#ffd343', category: 'backend' },
  { name: 'GraphQL',         icon: 'SiGraphql',     color: '#e535ab', category: 'backend' },
  { name: 'Prisma',          icon: 'SiPrisma',      color: '#5a67d8', category: 'backend' },
  { name: 'PostgreSQL',      icon: 'SiPostgresql',  color: '#336791', category: 'db', is_primary: true },
  { name: 'MongoDB',         icon: 'SiMongodb',     color: '#47a248', category: 'db' },
  { name: 'Redis',           icon: 'SiRedis',       color: '#dc382d', category: 'db' },
  { name: 'Docker',          icon: 'SiDocker',      color: '#2496ed', category: 'db', is_primary: true },
  { name: 'AWS',             icon: 'AwsIcon',       color: '#ff9900', category: 'db' },
  { name: 'Vercel',          icon: 'SiVercel',      color: '#888888', category: 'db' },
  { name: 'Supabase',        icon: 'SiSupabase',    color: '#3ecf8e', category: 'db' },
  { name: 'Figma',           icon: 'SiFigma',       color: '#a259ff', category: 'design', is_primary: true },
  { name: 'Git',             icon: 'SiGit',         color: '#f05032', category: 'design' },
  { name: 'Linux',           icon: 'SiLinux',       color: '#fcc624', category: 'design' },
]

/* ── Tilt chip ─────────────────────────────────────────── */
interface SkillChipProps { name: string; icon: string; color: string; primary?: boolean }

function SkillChip({ name, icon, color, primary }: SkillChipProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [hovered, setHovered] = useState(false)

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5
    const y = (e.clientY - top) / height - 0.5
    setTilt({ rx: -y * 14, ry: x * 14 })
  }, [])

  const onMouseLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0 })
    setHovered(false)
  }, [])

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onMouseLeave}
      animate={{
        rotateX: tilt.rx,
        rotateY: tilt.ry,
        scale: hovered ? 1.04 : 1,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 600,
        background: hovered ? `color-mix(in srgb, ${color} 10%, var(--glass-bg))` : 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: primary
          ? `1px solid color-mix(in srgb, ${color} 50%, transparent)`
          : '1px solid var(--glass-border)',
        boxShadow: primary
          ? `0 0 0 1px color-mix(in srgb, ${color} 25%, transparent), 0 1px 0 0 var(--glass-highlight) inset${hovered ? `, 0 0 18px color-mix(in srgb, ${color} 30%, transparent)` : ''}`
          : `0 1px 0 0 var(--glass-highlight) inset${hovered ? `, 0 0 14px color-mix(in srgb, ${color} 20%, transparent)` : ''}`,
      }}
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl cursor-default select-none relative overflow-hidden"
    >
      {hovered && (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${color}, transparent 70%)`,
          }}
        />
      )}
      <DynamicIcon
        name={icon}
        size={16}
        style={{ color: color, position: 'relative', zIndex: 1 }}
      />
      <span
        className="text-xs font-semibold relative z-10"
        style={{ color: 'var(--foreground)' }}
      >
        {name}
      </span>
    </motion.div>
  )
}

/* ── Marquee strip ─────────────────────────────────────── */
function MarqueeStrip({ skills, isRTL }: { skills: SkillChipProps[]; isRTL: boolean }) {
  if (!skills || skills.length === 0) return null

  // Tripled array ensures seamless 0% -> 33.333% looping with zero jumps or cuts
  const triple = [...skills, ...skills, ...skills]

  return (
    <div className="mt-14 overflow-hidden relative w-full py-3" aria-hidden="true">
      {/* Edge gradient masks for smooth entering/exiting */}
      <div
        className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, var(--background), transparent)' }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, var(--background), transparent)' }}
      />

      <motion.div
        animate={{
          x: isRTL ? ['0%', '33.333%'] : ['0%', '-33.333%'],
        }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: Math.max(16, skills.length * 2.2),
        }}
        className="flex items-center gap-10 w-max"
      >
        {triple.map((skill, i) => (
          <div
            key={`${skill.name}-${i}`}
            className="flex items-center gap-2.5 shrink-0 opacity-55 hover:opacity-100 transition-opacity"
          >
            <DynamicIcon
              name={skill.icon}
              size={18}
              style={{ color: skill.color || 'var(--foreground-secondary)' }}
            />
            <span
              className="text-xs font-medium tracking-wide"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              {skill.name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/* ── Main component ────────────────────────────────────── */
export default function Skills() {
  const content = useContent()
  const { isRTL, lang } = useLanguage()
  const skills = content.skills
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  // Build categories from DB items, fall back to hardcoded if empty
  const { categories, allFlat } = useMemo(() => {
    const dbItems = skills?.items || []
    const items = dbItems

    // Group by category
    const grouped = new Map<string, SkillChipProps[]>()
    for (const item of items) {
      const cat = item.category || 'other'
      if (!grouped.has(cat)) grouped.set(cat, [])
      grouped.get(cat)!.push({
        name: item.name,
        icon: item.icon,
        color: item.color || '#61dafb',
        primary: item.is_primary,
      })
    }

    // Sort categories by predefined order
    const sorted = CATEGORY_ORDER
      .filter(key => grouped.has(key))
      .map(key => ({
        key,
        label: CATEGORY_LABELS[key] || { en: key, ar: key },
        skills: grouped.get(key)!,
      }))

    // Add any unknown categories at the end
    for (const [key, skillList] of grouped) {
      if (!CATEGORY_ORDER.includes(key)) {
        sorted.push({
          key,
          label: CATEGORY_LABELS[key] || { en: key, ar: key },
          skills: skillList,
        })
      }
    }

    const flat = items.map(item => ({
      name: item.name,
      icon: item.icon,
      color: item.color || '#61dafb',
      primary: item.is_primary,
    }))

    return { categories: sorted, allFlat: flat }
  }, [skills?.items])

  if (categories.length === 0) return null

  return (
    <section
      id="skills"
      ref={ref}
      className="py-20 px-4 sm:px-6"
      style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'inherit' }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: 'var(--primary-accent)' }}
        >
          {skills.section_label}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
          className="text-3xl sm:text-4xl font-bold mb-10 text-balance"
          style={{ color: 'var(--foreground)' }}
        >
          {skills.heading}
        </motion.h2>

        {/* Categories */}
        <div className="flex flex-col gap-8">
          {categories.map((cat, ci) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 + ci * 0.08 }}
            >
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-3"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                {cat.label[lang as 'en' | 'ar']}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {cat.skills.map((skill, si) => (
                  <SkillChip key={`${skill.name}-${si}`} {...skill} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Marquee strip */}
        <MarqueeStrip skills={allFlat} isRTL={isRTL} />
      </div>
    </section>
  )
}
