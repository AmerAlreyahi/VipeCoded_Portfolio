'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { useContent } from '@/hooks/useContent'
import { useLanguage } from '@/context/LanguageContext'

export default function Navbar() {
  const content = useContent()
  const { lang, toggleLang, isRTL } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isDark = theme !== 'light'

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    if (pathname === '/') {
      // On homepage: smooth-scroll to the section
      const el = document.querySelector(href)
      el?.scrollIntoView({ behavior: 'smooth' })
    } else {
      // On any other page (e.g. /projects, /cv): navigate to /#section
      router.push(`/${href}`)
    }
  }

  const logoText = content?.nav?.logo || (isRTL ? 'أحمد.' : 'Ahmed.')
  const logoSettings = content?.nav?.logoSettings
  const logoImage = logoSettings?.logoImage
  const logoType = logoSettings?.logoType || (logoImage ? 'image' : 'text')

  // Default colors when no logoSettings exist
  const defaultStart = '#7c5cfc'
  const defaultEnd = '#22d3ee'

  const getLogoStyle = (): React.CSSProperties => {
    const start = logoSettings?.gradientStart || defaultStart
    const end = logoSettings?.gradientEnd || defaultEnd
    const solid = logoSettings?.solidColor || defaultStart
    const glow = logoSettings?.glowColor || start

    const style: React.CSSProperties = {
      fontFamily: isRTL ? 'var(--font-arabic)' : 'inherit',
      '--logo-glow': glow,
      '--logo-start': start,
      '--logo-end': end,
    } as React.CSSProperties

    if (logoSettings?.colorType === 'solid') {
      style.color = solid
    } else {
      // Default to gradient always
      style.background = `linear-gradient(135deg, ${start}, ${end})`
      style.WebkitBackgroundClip = 'text'
      style.WebkitTextFillColor = 'transparent'
      style.backgroundClip = 'text'
    }

    return style
  }

  const getAnimationClass = () => {
    const anim = logoSettings?.animation || 'gradient-flow'
    switch (anim) {
      case 'gradient-flow': return 'animate-logo-gradient-flow'
      case 'glow-pulse': return 'animate-logo-glow-pulse'
      case 'bounce': return 'animate-logo-bounce'
      case 'shimmer': return 'animate-logo-shimmer'
      case 'neon-flicker': return 'animate-logo-neon-flicker'
      case 'none': return ''
      default: return 'animate-logo-gradient-flow'
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'border-b' : 'bg-transparent'}`}
        style={{
          backdropFilter: scrolled ? 'blur(18px)' : undefined,
          WebkitBackdropFilter: scrolled ? 'blur(18px)' : undefined,
          backgroundColor: scrolled
            ? isDark ? 'rgba(5,6,15,0.82)' : 'rgba(240,242,248,0.82)'
            : 'transparent',
          borderColor: scrolled ? 'var(--glass-border)' : 'transparent',
          boxShadow: scrolled ? '0 1px 0 0 var(--glass-highlight) inset' : undefined,
        }}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => { e.preventDefault(); handleNavClick('#hero') }}
            className="inline-flex items-center transition-transform hover:scale-105"
          >
            {logoType === 'image' && logoImage ? (
              <img
                src={logoImage}
                alt={logoText}
                className={`h-9 w-auto max-h-9 object-contain inline-block ${getAnimationClass()}`}
                style={getLogoStyle()}
              />
            ) : (
              <span
                className={`text-xl sm:text-2xl font-bold tracking-tight inline-block ${getAnimationClass()}`}
                style={getLogoStyle()}
              >
                {logoText}
              </span>
            )}
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-6">
            {(content?.nav?.links || []).map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm font-medium transition-colors hover:text-[--primary-accent]"
                  style={{ color: 'var(--foreground-secondary)', fontFamily: isRTL ? 'var(--font-arabic)' : 'inherit' }}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:text-[--primary-accent] glass-card"
              style={{ color: 'var(--foreground-secondary)' }}
              aria-label="Toggle language"
            >
              {lang === 'en' ? 'AR' : 'EN'}
            </button>

            {mounted && (
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:text-[--primary-accent] glass-card"
                aria-label="Toggle theme"
              >
                <motion.div animate={{ rotate: isDark ? 0 : 180 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
                  {isDark
                    ? <Sun size={15} style={{ color: 'var(--foreground-secondary)' }} />
                    : <Moon size={15} style={{ color: 'var(--foreground-secondary)' }} />}
                </motion.div>
              </button>
            )}

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full transition-all glass-card"
              aria-label="Toggle menu"
            >
              {menuOpen
                ? <X size={15} style={{ color: 'var(--foreground)' }} />
                : <Menu size={15} style={{ color: 'var(--foreground)' }} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed top-16 left-0 right-0 z-40 border-b"
            style={{
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              backgroundColor: isDark ? 'rgba(5,6,15,0.94)' : 'rgba(240,242,248,0.94)',
              borderColor: 'var(--glass-border)',
            }}
          >
            <ul className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
              {(content?.nav?.links || []).map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="w-full py-3 px-4 rounded-xl text-sm font-medium transition-colors hover:text-[--primary-accent]"
                    style={{
                      color: 'var(--foreground)',
                      textAlign: isRTL ? 'right' : 'left',
                      fontFamily: isRTL ? 'var(--font-arabic)' : 'inherit',
                    }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
