'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import { canOptimizeImage } from '@/lib/utils'
import {
  FaGlobe, FaMobileScreen, FaPalette, FaCirclePlay, FaBoxOpen,
  FaArrowUpRightFromSquare, FaGithub, FaEye, FaBookOpen, FaFilm, FaCircleInfo, FaImage,
} from 'react-icons/fa6'

export type ProjectCategory = 'web' | 'mobile' | 'design' | 'video' | 'other'

export interface ProjectLink {
  url?: string
  label?: string
}

export interface ProjectCardProps {
  title: string
  description: string
  image: string
  tags: string[]
  category?: ProjectCategory
  primaryLink?: ProjectLink
  secondaryLink?: ProjectLink
  coming_soon?: string
  lang?: 'en' | 'ar'
  delay?: number
  featured?: boolean
}

const categoryMeta: Record<ProjectCategory, {
  icon: React.ReactNode
  label: { en: string; ar: string }
  primary: { en: string; ar: string }
  secondary: { en: string; ar: string }
}> = {
  web:    { icon: <FaGlobe size={11} />,        label: { en: 'Web',    ar: 'ويب'    }, primary: { en: 'Live',         ar: 'تجربة'           }, secondary: { en: 'Code',         ar: 'الكود'       } },
  mobile: { icon: <FaMobileScreen size={11} />, label: { en: 'Mobile', ar: 'موبايل' }, primary: { en: 'Try the App',  ar: 'جرّب التطبيق'    }, secondary: { en: 'Code',         ar: 'الكود'       } },
  design: { icon: <FaPalette size={11} />,      label: { en: 'Design', ar: 'تصميم'  }, primary: { en: 'View Design',  ar: 'شاهد التصميم'    }, secondary: { en: 'Case Study',   ar: 'دراسة الحالة'} },
  video:  { icon: <FaCirclePlay size={11} />,   label: { en: 'Video',  ar: 'فيديو'  }, primary: { en: 'Watch Demo',   ar: 'شاهد العرض'      }, secondary: { en: 'Behind the Scenes', ar: 'خلف الكواليس' } },
  other:  { icon: <FaBoxOpen size={11} />,      label: { en: 'Other',  ar: 'أخرى'  }, primary: { en: 'View Project', ar: 'عرض المشروع'     }, secondary: { en: 'More Info',     ar: 'تفاصيل أكثر' } },
}

function primaryIcon(cat: ProjectCategory) {
  if (cat === 'video')  return <FaCirclePlay size={11} />
  if (cat === 'design') return <FaEye size={11} />
  if (cat === 'mobile') return <FaMobileScreen size={11} />
  return <FaArrowUpRightFromSquare size={11} />
}
function secondaryIcon(cat: ProjectCategory) {
  if (cat === 'video')  return <FaFilm size={11} />
  if (cat === 'design') return <FaBookOpen size={11} />
  return <FaGithub size={13} />
}

export default function ProjectCard({
  title, description, image, tags,
  category = 'other', primaryLink, secondaryLink,
  coming_soon = 'Coming Soon', lang = 'en', delay = 0, featured = false
}: ProjectCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const meta = categoryMeta[category] ?? categoryMeta.other
  const catLabel = meta.label[lang]
  const imageSrc = image?.startsWith('http') || image?.startsWith('/') ? image : `/images/${image}`
  const hasPrimary   = !!primaryLink?.url
  const hasSecondary = !!secondaryLink?.url
  const hasAnyLink   = hasPrimary || hasSecondary
  const primaryLabel   = primaryLink?.label   ?? meta.primary[lang]
  const secondaryLabel = secondaryLink?.label ?? meta.secondary[lang]

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      whileHover={{ y: -3 }}
      className="group rounded-2xl overflow-hidden flex flex-col h-full transition-shadow duration-300 glass-card"
      style={{ boxShadow: '0 1px 0 0 var(--glass-highlight) inset' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px var(--ring), 0 1px 0 0 var(--glass-highlight) inset`
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-accent)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 0 var(--glass-highlight) inset'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)'
      }}
    >
      {/* Image */}
      <div className="relative w-full shrink-0 overflow-hidden bg-black/10 flex items-center justify-center" style={{ aspectRatio: '16/10' }}>
        {(!image || image === 'project-placeholder.png' || image === '/images/project-placeholder.png') ? (
          <div className="flex flex-col items-center justify-center opacity-60" style={{ color: 'var(--foreground-secondary)' }}>
            <FaImage size={32} className="mb-3 opacity-50" />
            <span className="text-xs font-medium tracking-wide uppercase">{lang === 'ar' ? 'لا توجد صورة' : 'No Image'}</span>
          </div>
        ) : (
          <Image
            src={imageSrc}
            alt={title}
            unoptimized={!canOptimizeImage(imageSrc)}
            fill
            priority={featured}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div
          className="absolute inset-0 opacity-50"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--card-solid, var(--background)))' }}
        />
        {/* Category badge */}
        <div
          className="absolute top-3 start-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--primary-accent) 18%, transparent)',
            borderColor: 'color-mix(in srgb, var(--primary-accent) 35%, transparent)',
            color: 'var(--primary-accent)',
          }}
        >
          {meta.icon}
          {catLabel}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--foreground-secondary)' }}>
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-xs font-medium border"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--foreground-secondary)',
                backgroundColor: 'var(--muted)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Links */}
        {hasAnyLink ? (
          <div className="flex gap-2 pt-1">
            {hasPrimary && (
              <a
                href={primaryLink!.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white gradient-bg transition-opacity hover:opacity-90"
                aria-label={`${primaryLabel} — ${title}`}
              >
                {primaryIcon(category)}
                {primaryLabel}
              </a>
            )}
            {hasSecondary && (
              <a
                href={secondaryLink!.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all hover:border-[--primary-accent] hover:text-[--primary-accent]"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                aria-label={`${secondaryLabel} — ${title}`}
              >
                {secondaryIcon(category)}
                {secondaryLabel}
              </a>
            )}
          </div>
        ) : (
          <p className="pt-1 text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            <FaCircleInfo size={12} />
            {coming_soon}
          </p>
        )}
      </div>
    </motion.article>
  )
}
