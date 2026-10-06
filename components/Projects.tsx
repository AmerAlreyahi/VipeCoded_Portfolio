'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa6'
import { useContent } from '@/hooks/useContent'
import { useLanguage } from '@/context/LanguageContext'
import ProjectCard, { type ProjectCardProps } from '@/components/ProjectCard'

const CARD_WIDTH = 280   // px
const CARD_GAP   = 16    // px
const STEP       = CARD_WIDTH + CARD_GAP
const SPEED      = 0.15  // px / 16ms frame (reduced from 0.5 for smoother motion)
const RESUME_MS  = 2200

export default function Projects() {
  const content = useContent()
  const { isRTL, lang } = useLanguage()
  const projects = content.projects
  const allFeatured = (projects.items as ProjectCardProps[]).filter((p) => p.featured)
  const featured = allFeatured.length > 0 ? allFeatured : (projects.items as ProjectCardProps[]).slice(0, 4)

  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const scrollPos = Math.abs(container.scrollLeft)
    const cardWidth = 290
    const newIdx = Math.round(scrollPos / cardWidth)
    setActiveIdx(Math.min(newIdx, featured.length - 1))
  }

  const scrollToCard = (index: number) => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const cardWidth = 290
    const targetScroll = isRTL ? -(index * cardWidth) : index * cardWidth
    container.scrollTo({ left: targetScroll, behavior: 'smooth' })
    setActiveIdx(index)
  }

  return (
    <section
      id="projects"
      className="py-20 px-4 sm:px-6 overflow-hidden"
      style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'inherit' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div ref={headerRef}>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: 'var(--primary-accent)' }}
          >
            {projects.section_label}
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
            className="text-3xl sm:text-4xl font-bold mb-10 text-balance"
            style={{ color: 'var(--foreground)' }}
          >
            {projects.heading}
          </motion.h2>
        </div>

        {/* Desktop / tablet grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((project, i) => (
            <ProjectCard
              key={`${project.title}-${i}`}
              {...project}
              coming_soon={projects.coming_soon}
              lang={lang as 'en' | 'ar'}
              delay={i * 0.1}
            />
          ))}
        </div>

        {/* Mobile infinite animated marquee slider */}
        <div className="sm:hidden w-full overflow-hidden" dir="ltr">
          <motion.div
            className="flex gap-4 py-2"
            style={{ width: 'max-content' }}
            animate={{
              x: ['0%', '-50%']
            }}
            transition={{
              ease: 'linear',
              duration: Math.max(14, featured.length * 7),
              repeat: Infinity,
            }}
          >
            {[...featured, ...featured].map((project, i) => (
              <div
                key={`mobile-${project.title}-${i}`}
                className="shrink-0"
                style={{ width: '280px' }}
              >
                <ProjectCard
                  {...project}
                  coming_soon={projects.coming_soon}
                  lang={lang as 'en' | 'ar'}
                  delay={0}
                />
              </div>
            ))}
          </motion.div>
        </div>

        {/* View All */}
        <div className="flex justify-center mt-10">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-white gradient-bg transition-opacity hover:opacity-90"
          >
            {projects.view_all}
            {isRTL ? <FaArrowLeft size={13} /> : <FaArrowRight size={13} />}
          </Link>
        </div>
      </div>
    </section>
  )
}
