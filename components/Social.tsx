'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { LoaderCircle } from 'lucide-react'
import {
  FaGithub, FaLinkedin, FaXTwitter, FaInstagram, FaWhatsapp, FaEnvelope, FaAward, FaGlobe, FaCheck, FaCopy,
  FaDiscord, FaTelegram, FaYoutube,
} from 'react-icons/fa6'
import { SiResearchgate } from 'react-icons/si'
import { useContent } from '@/hooks/useContent'
import { useLanguage } from '@/context/LanguageContext'

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

export default function Social() {
  const content = useContent()
  const { isRTL, lang } = useLanguage()
  const social = content.social
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [formError, setFormError] = useState('')

  // Only render links that have a real URL
  const activeLinks = social.links.filter((l) => l.url && l.url.trim() !== '')

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(social.email || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    setFormStatus('sending')
    setFormError('')

    try {
      const website = new FormData(formElement).get('website')
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website }),
      })
      const result = await response.json() as { ok?: boolean; error?: string }

      if (!response.ok || !result.ok) {
        setFormError(result.error || (lang === 'ar' ? 'تعذر إرسال الرسالة. حاول مرة أخرى.' : 'Could not send your message. Please try again.'))
        setFormStatus('error')
        return
      }

      setForm({ name: '', email: '', subject: '', message: '' })
      setFormStatus('sent')
      formElement.reset()
    } catch {
      setFormError(lang === 'ar' ? 'تعذر الاتصال. تحقق من اتصالك وحاول مرة أخرى.' : 'Could not connect. Check your connection and try again.')
      setFormStatus('error')
    }
  }

  const fieldClassName = 'w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-[--primary-accent]'
  const fieldStyle = {
    backgroundColor: 'var(--glass-bg)',
    borderColor: 'var(--glass-border)',
    color: 'var(--foreground)',
  }

  return (
    <section
      id="contact"
      ref={ref}
      className="py-20 px-4 sm:px-6"
      style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'inherit' }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-xs font-bold uppercase tracking-widest mb-3 text-center"
          style={{ color: 'var(--primary-accent)' }}
        >
          {social.section_label}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
          className="text-3xl sm:text-4xl font-bold mb-4 text-center text-balance"
          style={{ color: 'var(--foreground)' }}
        >
          {social.heading}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.14 }}
          className="text-center mb-12"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {social.subheading}
        </motion.p>

        {/* Social links panel */}
        {activeLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            className="relative max-w-xl mx-auto rounded-3xl px-8 py-10 glass-card"
          >
            {/* Availability badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2"
              style={{
                background: 'color-mix(in srgb, var(--primary-accent) 12%, var(--background))',
                border: '1px solid color-mix(in srgb, var(--primary-accent) 35%, transparent)',
                color: 'var(--primary-accent)',
              }}
            >
              <span className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: 'var(--primary-accent)' }} />
              {lang === 'ar' ? 'متاح للعمل' : 'Available for work'}
            </motion.div>

            {/* Icon grid — wrapping flex, centered, uniform spacing */}
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {activeLinks.map((link, i) => {
                const Icon = getIconComponent(link.icon, link.platform)
                return (
                  <motion.a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    title={link.platform}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.35, ease: 'easeOut', delay: 0.32 + i * 0.05 }}
                    whileHover={{ scale: 1.18, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center gap-1.5 group"
                    style={{ width: 64 }}
                  >
                    <span
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 glass-card"
                      style={{ color: 'var(--foreground-secondary)' }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement
                        el.style.color = link.color
                        el.style.borderColor = `color-mix(in srgb, ${link.color} 50%, transparent)`
                        el.style.boxShadow = `0 0 22px color-mix(in srgb, ${link.color} 35%, transparent), 0 1px 0 0 var(--glass-highlight) inset`
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
                      <Icon size={21} />
                    </span>
                    <span
                      className="text-[10px] font-medium text-center leading-tight opacity-50 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      {link.platform.replace(' (Twitter)', '').replace('X (Twitter)', 'X')}
                    </span>
                  </motion.a>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Copyable email */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.5 }}
          className="flex justify-center mt-8"
        >
          <motion.button
            onClick={copyEmail}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="group flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 glass-card hover:border-[--primary-accent] hover:shadow-[0_0_24px_color-mix(in_srgb,var(--primary-accent)_30%,transparent)]"
            aria-label={copied ? social.email_copied_label : social.email_copy_label}
          >
            <span className="text-sm font-medium transition-colors duration-300 group-hover:text-[--primary-accent]" style={{ color: 'var(--foreground)' }}>
              {social.email}
            </span>
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                backgroundColor: copied ? 'var(--primary-accent)' : 'var(--muted)',
                color: copied ? '#fff' : 'var(--foreground-secondary)',
              }}
            >
              {copied ? <FaCheck size={13} /> : <FaCopy size={13} />}
            </span>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.56 }}
          className="max-w-2xl mx-auto mt-12 p-6 sm:p-8 rounded-3xl glass-card"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              {lang === 'ar' ? 'أرسل رسالة' : 'Send a message'}
            </h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--foreground-secondary)' }}>
              {lang === 'ar' ? 'سأرد عليك في أقرب وقت ممكن.' : 'I’ll get back to you as soon as I can.'}
            </p>
          </div>

          <form onSubmit={sendMessage} className="flex flex-col gap-4">
            <div
              className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
              aria-hidden="true"
            >
              <label htmlFor="contact-website">Website</label>
              <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs font-semibold" style={{ color: 'var(--foreground-secondary)' }}>
                {lang === 'ar' ? 'الاسم' : 'Name'}
                <input
                  required
                  name="name"
                  maxLength={100}
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className={fieldClassName}
                  style={fieldStyle}
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold" style={{ color: 'var(--foreground-secondary)' }}>
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                <input
                  required
                  type="email"
                  name="email"
                  maxLength={254}
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className={fieldClassName}
                  style={{ ...fieldStyle, direction: 'ltr' }}
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-xs font-semibold" style={{ color: 'var(--foreground-secondary)' }}>
              {lang === 'ar' ? 'الموضوع (اختياري)' : 'Subject (optional)'}
              <input
                name="subject"
                maxLength={150}
                value={form.subject}
                onChange={(event) => setForm({ ...form, subject: event.target.value })}
                className={fieldClassName}
                style={fieldStyle}
              />
            </label>

            <label className="flex flex-col gap-2 text-xs font-semibold" style={{ color: 'var(--foreground-secondary)' }}>
              {lang === 'ar' ? 'الرسالة' : 'Message'}
              <textarea
                required
                name="message"
                rows={5}
                maxLength={5000}
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                className={`${fieldClassName} resize-y`}
                style={fieldStyle}
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p
                aria-live="polite"
                role={formStatus === 'error' ? 'alert' : 'status'}
                className="min-h-5 text-sm"
                style={{
                  color: formStatus === 'error' ? '#f87171' : formStatus === 'sent' ? '#34d399' : 'var(--foreground-secondary)',
                }}
              >
                {formStatus === 'sending'
                  ? (lang === 'ar' ? 'جارٍ إرسال الرسالة…' : 'Sending your message…')
                  : formStatus === 'sent'
                    ? (lang === 'ar' ? 'تم إرسال رسالتك بنجاح.' : 'Your message was sent successfully.')
                    : formError}
              </p>
              <button
                type="submit"
                disabled={formStatus === 'sending'}
                className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white gradient-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {formStatus === 'sending' && <LoaderCircle size={16} className="animate-spin" />}
                {lang === 'ar' ? 'إرسال الرسالة' : 'Send message'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
