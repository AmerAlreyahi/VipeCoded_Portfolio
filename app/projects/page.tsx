'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useMotionValue, useTransform, animate, useMotionValueEvent } from 'framer-motion'
import { FaArrowLeft, FaArrowRight, FaStar, FaCode, FaGithub, FaExternalLinkAlt } from 'react-icons/fa'
import { useContent } from '@/hooks/useContent'
import { useLanguage } from '@/context/LanguageContext'
import ProjectCard, { type ProjectCardProps } from '@/components/ProjectCard'
import Navbar from '@/components/Navbar'

interface GithubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  stargazers_count: number
  language: string | null
  topics: string[]
  isPlaceholder?: boolean
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Vue: '#41b883',
  Swift: '#FA7343',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  'C#': '#178600',
  Ruby: '#701516',
}

export default function ProjectsPage() {
  const content = useContent()
  const { isRTL, lang } = useLanguage()
  const router = useRouter()
  const projects = content.projects
  const githubUsername = content.github?.username
  const [repos, setRepos] = useState<GithubRepo[]>([])
  const [reposLoading, setReposLoading] = useState(!!githubUsername)

  // ── Fetch GitHub repos ──────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (!githubUsername) {
        setReposLoading(false)
        return
      }
      try {
        const res = await fetch('/api/github-repos')
        if (res.ok) {
          const data = await res.json()
          setRepos(data)
        }
      } catch {
        // silently fail — section simply won't render
      } finally {
        setReposLoading(false)
      }
    }
    load()
  }, [githubUsername])

  // ── Drag-to-go-back ─────────────────────────────────────────────────────
  // In LTR (English): drag right  → go back
  // In RTL (Arabic):  drag left   → go back  (mirrored)
  const x = useMotionValue(0)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768)
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const shadowOpacity = useTransform(x, (v) => {
    const abs = Math.abs(v)
    return Math.min(abs / 120, 1) * 0.55
  })
  const boxShadow = useTransform(shadowOpacity, (o) =>
    isRTL ? `18px 0 40px rgba(0,0,0,${o})` : `-18px 0 40px rgba(0,0,0,${o})`
  )

  useMotionValueEvent(x, "change", (latest) => {
    if (isNavigating || !isMobile) return

    const vw = typeof window !== 'undefined' ? window.innerWidth : 390
    // If we drag close to 50% of the screen width, trigger back automatically
    const threshold = vw * 0.48
    const offset = isRTL ? -latest : latest

    if (offset > threshold) {
      setIsNavigating(true)
      router.push('/')
    }
  })

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      if (isNavigating || !isMobile) return

      const vw = typeof window !== 'undefined' ? window.innerWidth : 390
      const velocityThreshold = 450

      // LTR: positive x (rightward) = back. RTL: negative x (leftward) = back.
      const velocity = isRTL ? -info.velocity.x : info.velocity.x

      if (velocity > velocityThreshold) {
        setIsNavigating(true)
        const target = isRTL ? -(vw * 0.5) : (vw * 0.5)
        animate(x, target, { type: 'spring', stiffness: 280, damping: 28 })
        router.push('/')
      } else {
        // Snap back to exactly 0
        animate(x, 0, { type: 'spring', stiffness: 340, damping: 32 })
      }
    },
    [router, x, isRTL, isNavigating, isMobile]
  )

  // Allow dragging up to 50% of the viewport width in the back direction
  const vwSafe = typeof window !== 'undefined' ? window.innerWidth : 390
  const dragConstraints = isRTL
    ? { left: -(vwSafe * 0.5), right: 0 }
    : { left: 0, right: vwSafe * 0.5 }

  return (
    <div className="min-h-screen">
      <motion.div
        className="min-h-screen"
        style={{
          x,
          boxShadow,
          fontFamily: isRTL ? 'var(--font-arabic)' : 'inherit',
          touchAction: 'pan-y',
          cursor: (isMobile && !isNavigating) ? 'grab' : 'auto',
          pointerEvents: isNavigating ? 'none' : 'auto',
        }}
        drag={isMobile ? "x" : false}
        dragConstraints={dragConstraints}
        dragElastic={{ left: isRTL ? 0.15 : 0, right: isRTL ? 0 : 0.15 }}
        dragDirectionLock
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: isMobile ? 'grabbing' : 'auto' }}
      >
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20">
          {/* Back link */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[--primary-accent]"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              {isRTL ? <FaArrowRight size={13} /> : <FaArrowLeft size={13} />}
              {projects.back_home}
            </Link>
          </div>

          {/* Page heading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: 'var(--primary-accent)' }}
          >
            {projects.section_label}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
            className="text-3xl sm:text-4xl font-bold mb-12 text-balance"
            style={{ color: 'var(--foreground)' }}
          >
            {projects.all_heading}
          </motion.h1>

          {/* All curated projects grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(projects.items as ProjectCardProps[]).map((project, i) => (
              <ProjectCard
                key={project.title}
                {...project}
                coming_soon={projects.coming_soon}
                lang={lang as 'en' | 'ar'}
                delay={i * 0.07}
              />
            ))}
          </div>

          {/* ── More from GitHub ──────────────────────────────────────────── */}
          {(reposLoading || repos.length > 0) && (
            <section className="mt-20">
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'var(--primary-accent)' }}
              >
                {lang === 'ar' ? 'المزيد من GitHub' : 'More from GitHub'}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.06 }}
                className="text-2xl sm:text-3xl font-bold mb-8"
                style={{ color: 'var(--foreground)' }}
              >
                {lang === 'ar' ? 'مستودعات مثبّتة.' : 'Pinned repositories.'}
              </motion.h2>

              {reposLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border p-5 h-40 animate-pulse"
                      style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {repos.map((repo, i) => (
                    <motion.article
                      key={repo.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.06 }}
                      className={`glass-card rounded-2xl p-5 flex flex-col gap-3 group ${!repo.isPlaceholder && 'hover:border-[--primary-accent]'} transition-colors ${repo.isPlaceholder ? 'opacity-70' : ''}`}
                      style={{
                        borderColor: repo.isPlaceholder ? 'var(--muted)' : 'var(--glass-border)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="font-semibold text-sm leading-snug"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {repo.name}
                        </h3>
                        <div
                          className="flex items-center gap-1 shrink-0 text-xs"
                          style={{ color: 'var(--foreground-secondary)' }}
                        >
                          <FaStar size={11} />
                          <span>{repo.stargazers_count}</span>
                        </div>
                      </div>

                      {repo.description && (
                        <p
                          className="text-xs leading-relaxed flex-1 line-clamp-2"
                          style={{ color: 'var(--foreground-secondary)' }}
                        >
                          {repo.description}
                        </p>
                      )}

                      {repo.language && (
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: LANG_COLORS[repo.language] ?? '#888' }}
                          />
                          <FaCode size={10} />
                          {repo.language}
                        </div>
                      )}

                      {!repo.isPlaceholder && (
                        <div className="flex gap-2 pt-1">
                          {repo.homepage && (
                            <a
                              href={repo.homepage}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold text-white gradient-bg hover:opacity-90 transition-opacity"
                            >
                              <FaExternalLinkAlt size={10} />
                              {lang === 'ar' ? 'عرض حي' : 'Live Demo'}
                            </a>
                          )}
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold border hover:border-[--primary-accent] hover:text-[--primary-accent] transition-colors"
                            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                          >
                            <FaGithub size={12} />
                            {lang === 'ar' ? 'الكود' : 'Source'}
                          </a>
                        </div>
                      )}
                    </motion.article>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </motion.div>
    </div>
  )
}
