'use client'

import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { UserRound } from 'lucide-react'
import { useContent } from '@/hooks/useContent'
import { useLanguage } from '@/context/LanguageContext'
import { canOptimizeImage } from '@/lib/utils'
import {
  FaGithub, FaLinkedin, FaXTwitter, FaInstagram, FaWhatsapp,
  FaEnvelope, FaAward, FaGlobe, FaDiscord, FaTelegram, FaYoutube
} from 'react-icons/fa6'
import { SiResearchgate } from 'react-icons/si'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  FaGithub, github: FaGithub, GitHub: FaGithub, SiGithub: FaGithub,
  FaLinkedin, linkedin: FaLinkedin, LinkedIn: FaLinkedin, SiLinkedin: FaLinkedin,
  FaXTwitter, twitter: FaXTwitter, Twitter: FaXTwitter, x: FaXTwitter, X: FaXTwitter, SiTwitter: FaXTwitter, SiXTwitter: FaXTwitter,
  FaInstagram, instagram: FaInstagram, Instagram: FaInstagram, SiInstagram: FaInstagram,
  FaWhatsapp, whatsapp: FaWhatsapp, WhatsApp: FaWhatsapp, SiWhatsapp: FaWhatsapp,
  FaEnvelope, mail: FaEnvelope, email: FaEnvelope, Email: FaEnvelope, FaMail: FaEnvelope,
  FaDiscord, discord: FaDiscord, Discord: FaDiscord, SiDiscord: FaDiscord,
  FaTelegram, telegram: FaTelegram, Telegram: FaTelegram, SiTelegram: FaTelegram,
  FaYoutube, youtube: FaYoutube, YouTube: FaYoutube, SiYoutube: FaYoutube,
  FaResearchgate: SiResearchgate, SiResearchgate, researchgate: SiResearchgate, ResearchGate: SiResearchgate,
  FaAward, Award: FaAward,
}

function getIconComponent(iconKey?: string, platform?: string): React.ComponentType<{ size?: number }> {
  if (iconKey && ICON_MAP[iconKey]) return ICON_MAP[iconKey]
  if (platform && ICON_MAP[platform]) return ICON_MAP[platform]
  if (platform && ICON_MAP[platform.toLowerCase()]) return ICON_MAP[platform.toLowerCase()]
  
  const p = (platform || iconKey || '').toLowerCase()
  if (p.includes('git')) return FaGithub
  if (p.includes('link')) return FaLinkedin
  if (p.includes('twit') || p === 'x') return FaXTwitter
  if (p.includes('insta')) return FaInstagram
  if (p.includes('whats') || p.includes('phone')) return FaWhatsapp
  if (p.includes('mail') || p.includes('email')) return FaEnvelope
  if (p.includes('disc')) return FaDiscord
  if (p.includes('tele')) return FaTelegram
  if (p.includes('you') || p.includes('tube')) return FaYoutube
  if (p.includes('research')) return SiResearchgate
  return FaGlobe
}

const DEFAULT_SOCIAL_LINKS = [
  { platform: 'GitHub', url: 'https://github.com', color: '#ffffff', icon: 'FaGithub' },
  { platform: 'LinkedIn', url: 'https://linkedin.com', color: '#0a66c2', icon: 'FaLinkedin' },
  { platform: 'Twitter', url: 'https://twitter.com', color: '#1da1f2', icon: 'FaXTwitter' },
]

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function Hero() {
  const content = useContent()
  const { isRTL, lang } = useLanguage()
  const hero = content.hero
  const social = content.social
  const avatar = hero.avatar || hero.image
  const [roleIndex, setRoleIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((i) => (i + 1) % (hero?.roles?.length || 1))
    }, 2800)
    return () => clearInterval(interval)
  }, [hero?.roles?.length])

  // Only render social links that have a non-empty URL (fallback if none in DB)
  const linksToUse = (social?.links && social.links.length > 0) ? social.links : DEFAULT_SOCIAL_LINKS
  const activeLinks = linksToUse.filter((l) => l.url && l.url.trim() !== '')

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-16"
      style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'inherit' }}
    >
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className={`flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16 ${isRTL ? 'md:flex-row-reverse' : ''}`}>

          {/* Text side */}
          <motion.div
            className="flex-1 text-center md:text-start"
            style={{ textAlign: isRTL ? 'right' : undefined }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={itemVariants}
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'var(--primary-accent)' }}
            >
              {hero.greeting}
            </motion.p>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-balance"
              style={{ color: 'var(--foreground)' }}
            >
              <span className="gradient-text">{hero.name}</span>
            </motion.h1>

            <motion.div variants={itemVariants} className="h-9 mb-4 overflow-hidden">
              <motion.p
                key={roleIndex}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-lg sm:text-xl font-medium"
                style={{ color: 'var(--secondary-accent)' }}
              >
                {hero.roles[roleIndex]}
              </motion.p>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg leading-relaxed mb-8 max-w-lg"
              style={{
                color: 'var(--foreground-secondary)',
                margin: isRTL ? '0 0 2rem auto' : '0 auto 2rem 0',
              }}
            >
              {hero.bio}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className={`flex flex-wrap gap-3 justify-center md:justify-start ${isRTL ? 'md:justify-end' : ''}`}
            >
              <a
                href={hero.cta_primary_href}
                className="px-6 py-3 rounded-full text-sm font-semibold text-white gradient-bg transition-all hover:opacity-90 hover:scale-105"
                style={{ boxShadow: '0 4px 24px var(--ring)' }}
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector(hero.cta_primary_href)?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                {hero.cta_primary}
              </a>
              {/* CV button navigates to /cv page */}
              <Link
                href="/cv"
                className="px-6 py-3 rounded-full text-sm font-semibold border transition-all hover:border-[--primary-accent] hover:text-[--primary-accent] hover:scale-105 glass-card"
                style={{ color: 'var(--foreground)' }}
              >
                {hero.cta_secondary}
              </Link>
            </motion.div>

            {/* Social icons row — only shown for links with a real URL */}
            {activeLinks.length > 0 && (
              <motion.div
                variants={itemVariants}
                className={`flex flex-wrap gap-2 mt-6 justify-center md:justify-start ${isRTL ? 'md:justify-end' : ''}`}
              >
                {activeLinks.map((link) => {
                  const Icon = getIconComponent(link.icon, link.platform)
                  return (
                    <motion.a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      title={link.platform}
                      whileHover={{ scale: 1.15, y: -3 }}
                      whileTap={{ scale: 0.92 }}
                      className="w-9 h-9 rounded-full flex items-center justify-center glass-card transition-all duration-200"
                      style={{ color: 'var(--foreground-secondary)' }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement
                        el.style.color = link.color
                        el.style.borderColor = `color-mix(in srgb, ${link.color} 50%, transparent)`
                        el.style.boxShadow = `0 0 14px color-mix(in srgb, ${link.color} 35%, transparent), 0 1px 0 0 var(--glass-highlight) inset`
                        el.style.background = `color-mix(in srgb, ${link.color} 12%, var(--glass-bg))`
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement
                        el.style.color = 'var(--foreground-secondary)'
                        el.style.borderColor = 'var(--glass-border)'
                        el.style.boxShadow = '0 1px 0 0 var(--glass-highlight) inset'
                        el.style.background = 'var(--glass-bg)'
                      }}
                    >
                      <Icon size={15} />
                    </motion.a>
                  )
                })}
              </motion.div>
            )}
          </motion.div>

          {/* Profile photo */}
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          >
            <div className="relative w-56 h-56 sm:w-72 sm:h-72">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-40 scale-110"
                style={{ background: 'var(--gradient)' }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 rounded-full p-[3px] gradient-bg"
                aria-hidden="true"
              >
                <div className="w-full h-full rounded-full" style={{ backgroundColor: 'var(--background)' }} />
              </div>
              <div className="absolute inset-[4px] rounded-full overflow-hidden">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={hero.name}
                    unoptimized={!canOptimizeImage(avatar)}
                    fill
                    sizes="(max-width: 640px) 224px, 288px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--glass-bg)', color: 'var(--primary-accent)' }}
                    aria-hidden="true"
                  >
                    <UserRound size={88} strokeWidth={1} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="text-xs text-center mt-16 tracking-widest uppercase"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {hero.scroll_hint}
        </motion.p>
      </div>
    </section>
  )
}
