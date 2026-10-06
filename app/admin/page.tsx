'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Briefcase, Code2, Mail,
  LogOut, ExternalLink, Users, Star, Activity,
  Save, Plus, Trash2, ChevronUp, ChevronDown, Upload,
  Check, AlertCircle, Loader2, Download, RefreshCw,
  GripVertical, Eye, EyeOff, User, Link as LinkIcon,
  Settings, Globe, Lock, Tv2, Palette, ShieldCheck, Copy, QrCode, ShieldAlert, KeyRound, Smartphone, LayoutTemplate
} from 'lucide-react'
import { FaGithub as Github } from 'react-icons/fa6'
import { DynamicIcon } from '@/components/Skills'

// ── Types mirroring content.json ──────────────────────────────────────────────
interface HeroContent {
  greeting: string; name: string; bio: string
  cta_primary: string; cta_primary_href: string
  cta_secondary: string; cta_secondary_href: string
  roles: string[]; avatar?: string; image?: string
}
interface AboutContent {
  section_label: string; heading: string
  paragraphs: string[]
  stats: Array<{ label: string; value: string | number }>
}
interface SkillItem { name: string; icon: string; category?: string; color?: string; is_primary?: boolean }
interface SkillsContent { section_label: string; heading: string; items: SkillItem[] }
interface ProjectItem {
  title: string; description: string; image: string
  tags: string[]; category: string; featured: boolean
  primaryLink: { url: string }; secondaryLink: { url: string }
}
interface ProjectsContent {
  section_label: string; heading: string; items: ProjectItem[]
  back_home?: string; all_heading?: string; coming_soon?: string; view_all?: string
}
interface CareerItem { 
  role: string; company: string; startDate: string; endDate: string; description: string
}
interface CareerContent { section_label: string; heading: string; items: CareerItem[] }
interface SocialLink { platform: string; url: string; color: string; icon: string }
interface SocialContent {
  links: SocialLink[]
  email?: string
  available_badge?: boolean
  availability_text?: string
}
interface CVContent { en: string; ar: string }
interface GitHubSettings { username: string; token?: string }
interface NavLogoSettings {
  colorType?: 'gradient' | 'solid'
  gradientStart?: string
  gradientEnd?: string
  solidColor?: string
  glowColor?: string
  logoImage?: string
  logoType?: 'text' | 'image'
  animation?: 'none' | 'gradient-flow' | 'glow-pulse' | 'shimmer' | 'bounce' | 'neon-flicker'
}
interface NavContent {
  logo?: string
  logoSettings?: NavLogoSettings
  links?: Array<{ label: string; href: string }>
}
interface FooterContent {
  copyright?: string
  back_to_top?: string
  tagline?: string
}
interface LangContent {
  hero: HeroContent; about: AboutContent; skills: SkillsContent
  projects: ProjectsContent; career: CareerContent
  social: SocialContent; cv: CVContent
  github?: GitHubSettings
  meta?: Record<string, string>; nav?: NavContent
  footer?: FooterContent
}
interface ContentJSON { en: LangContent; ar: LangContent }

// ── Save / upload status ──────────────────────────────────────────────────────
type SaveStatus   = 'idle' | 'saving' | 'saved' | 'error'
type UploadState  = 'idle' | 'uploading' | 'done' | 'error'

// ── Nav sections ──────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'overview',  label: 'Overview',         icon: <LayoutDashboard size={15} /> },
  { id: 'hero',      label: 'Hero',             icon: <User size={15} /> },
  { id: 'about',     label: 'About',            icon: <FileText size={15} /> },
  { id: 'skills',    label: 'Skills',           icon: <Star size={15} /> },
  { id: 'projects',  label: 'Projects',         icon: <Code2 size={15} /> },
  { id: 'career',    label: 'Career',           icon: <Briefcase size={15} /> },
  { id: 'social',    label: 'Social Links',     icon: <Users size={15} /> },
  { id: 'cv',        label: 'CV Files',         icon: <Download size={15} /> },
  { id: 'github',    label: 'GitHub Settings',  icon: <Github size={15} /> },
  { id: 'site',      label: 'Site Settings',    icon: <Settings size={15} /> },
  { id: 'account',   label: 'Account & Security', icon: <ShieldCheck size={15} /> },
]

// ── Shared primitives ─────────────────────────────────────────────────────────
function Field({
  label, value, onChange, multiline = false, mono = false, dir, type = 'text', onKeyDown
}: {
  label: string; value: string; onChange: (v: string) => void
  multiline?: boolean; mono?: boolean; dir?: 'ltr' | 'rtl'; type?: string
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}) {
  const [showPw, setShowPw] = useState(false)
  const isPassword = type === 'password'
  const currentType = isPassword && showPw ? 'text' : type

  const shared: React.CSSProperties = {
    width: '100%', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)',
    borderRadius: 12, color: 'var(--foreground)',
    fontSize: 13, padding: isPassword ? '8px 36px 8px 12px' : '8px 12px', outline: 'none',
    fontFamily: mono ? 'var(--font-mono, monospace)' : 'inherit',
    resize: multiline ? 'vertical' : undefined,
    direction: dir ?? 'ltr',
  }
  return (
    <div className="flex flex-col gap-1 w-full relative">
      <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--foreground-secondary)' }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value} rows={3}
          onChange={(e) => onChange(e.target.value)}
          style={shared}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary-accent)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)' }}
        />
      ) : (
        <div className="relative w-full">
          <input
            type={currentType} value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            style={shared}
            onFocus={(e) => { e.currentTarget.parentElement!.style.borderColor = 'var(--primary-accent)'; e.currentTarget.style.borderColor = 'var(--primary-accent)' }}
            onBlur={(e) => { e.currentTarget.parentElement!.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.borderColor = 'var(--glass-border)' }}
          />
          {isPassword && (
            <button 
              type="button" tabIndex={-1} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[--foreground-secondary] hover:text-[--foreground] transition-colors" 
              onClick={() => setShowPw(!showPw)}
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function SaveBar({ status, onSave }: { status: SaveStatus; onSave: () => void }) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl"
      style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
    >
      <AnimatePresence mode="wait">
        {status === 'saved' && (
          <motion.p key="saved" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#22c55e' }}>
            <Check size={13} /> Saved successfully
          </motion.p>
        )}
        {status === 'error' && (
          <motion.p key="error" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#ef4444' }}>
            <AlertCircle size={13} /> Save failed — check console
          </motion.p>
        )}
        {(status === 'idle' || status === 'saving') && (
          <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>
            {status === 'saving' ? 'Saving…' : 'Unsaved changes'}
          </motion.p>
        )}
      </AnimatePresence>
      <button
        onClick={onSave}
        disabled={status === 'saving'}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white gradient-bg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === 'saving' ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
        Save changes
      </button>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--foreground-secondary)' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter()
  const [active, setActive] = useState('overview')
  const [activeLang, setActiveLang] = useState<'en' | 'ar'>('en')
  const [loggingOut, setLoggingOut] = useState(false)
  const [content, setContent] = useState<ContentJSON | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('admin@portfolio')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  const [hasSecurityWarning, setHasSecurityWarning] = useState(false)
  const [showSecurityModal, setShowSecurityModal] = useState(false)

  const checkSecurityStatus = useCallback(async () => {
    const { createClient } = await import('@/utils/supabase/client')
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return
    
    const emailEnabled = userData.user.user_metadata?.email_login_enabled === true
    const { data: mfaData } = await supabase.auth.mfa.listFactors()
    const mfaEnabled = mfaData && mfaData.totp.length > 0
    
    if (!emailEnabled && !mfaEnabled) {
      setHasSecurityWarning(true)
      if (!sessionStorage.getItem('securityWarningDismissed')) {
        setShowSecurityModal(true)
      }
    } else {
      setHasSecurityWarning(false)
      setShowSecurityModal(false)
    }
  }, [])

  useEffect(() => {
    import('@/utils/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.email) {
          setCurrentUserEmail(data.user.email)
          setCurrentUserId(data.user.id)
          checkSecurityStatus()
        }
      })
    })

    fetch('/api/admin-content')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setContent(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const updateLang = useCallback((updater: (draft: LangContent) => void) => {
    setContent((prev) => {
      if (!prev) return prev
      const next = JSON.parse(JSON.stringify(prev)) as ContentJSON
      updater(next[activeLang])
      return next
    })
  }, [activeLang])

  const updateEnContent = useCallback((updater: (draft: LangContent) => void) => {
    setContent((prev) => {
      if (!prev) return prev
      const next = JSON.parse(JSON.stringify(prev)) as ContentJSON
      updater(next.en)
      return next
    })
  }, [])

  const updateArContent = useCallback((updater: (draft: LangContent) => void) => {
    setContent((prev) => {
      if (!prev) return prev
      const next = JSON.parse(JSON.stringify(prev)) as ContentJSON
      updater(next.ar)
      return next
    })
  }, [])

  const updateBoth = useCallback((updater: (draft: LangContent) => void) => {
    setContent((prev) => {
      if (!prev) return prev
      const next = JSON.parse(JSON.stringify(prev)) as ContentJSON
      updater(next.en)
      updater(next.ar)
      return next
    })
  }, [])

  async function handleSave() {
    if (!content || saveStatus === 'saving') return
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/admin-content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      })
      if (res.ok) {
        setSaveStatus('saved')
        if (saveTimer.current) clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    }
  }

  async function handleLogout() {
    setLoggingOut(true)
    const { createClient } = await import('@/utils/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary-accent)' }} />
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle size={32} style={{ color: '#ef4444', margin: '0 auto 12px' }} />
          <p className="text-sm" style={{ color: 'var(--foreground)' }}>Failed to load content.json</p>
        </div>
      </div>
    )
  }

  const currentLangContent = content[activeLang]

  return (
    <div className="h-screen flex overflow-hidden" dir="ltr">

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 border-r py-6 px-3"
        style={{
          borderColor: 'var(--glass-border)',
          background: 'rgba(5,6,15,0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          overflowY: 'auto',
        }}
      >
        <div className="px-3 mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--primary-accent)' }}>
            Portfolio
          </p>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Admin Panel</p>
        </div>

        <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className="flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-start relative overflow-hidden"
              style={{
                background: active === s.id ? 'color-mix(in srgb, var(--primary-accent) 14%, transparent)' : 'transparent',
                color: active === s.id ? 'var(--primary-accent)' : 'var(--foreground-secondary)',
                borderLeft: active === s.id ? '2px solid var(--primary-accent)' : '2px solid transparent',
              }}
            >
              <div className="flex items-center gap-2.5 z-10">
                {s.icon}
                {s.label}
              </div>
              {s.id === 'account' && hasSecurityWarning && (
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)] z-10" />
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="flex flex-col pt-4 border-t relative" style={{ borderColor: 'var(--glass-border)' }}>
          <a
            href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2.5 mb-2 rounded-xl text-[13px] font-medium transition-all hover:bg-white/5"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            <Eye size={15} />View site
          </a>

          {/* User Profile Badge (Bottom) */}
          <div className="w-full p-2.5 rounded-xl flex items-center gap-3 text-left mt-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[--primary-accent] to-[#22d3ee] p-[2px] shrink-0">
              <div className="w-full h-full rounded-full bg-[#05060f] flex items-center justify-center relative">
                <User size={14} style={{ color: 'var(--foreground)' }} />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#05060f]" />
              </div>
            </div>
            <div className="flex flex-col overflow-hidden flex-1">
              <span className="text-xs font-bold truncate text-[--foreground]">
                {currentUserEmail.split('@')[0]}
              </span>
              <span className="text-[10px] font-medium text-[--foreground-secondary] truncate">
                {currentUserEmail}
              </span>
            </div>
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 rounded-lg text-[--foreground-secondary] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 md:px-6 py-3 border-b shrink-0"
          style={{
            borderColor: 'var(--glass-border)',
            background: 'rgba(5,6,15,0.5)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg"
              style={{ color: 'var(--foreground-secondary)' }}
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Open navigation"
            >
              <GripVertical size={18} />
            </button>
            <div>
              <h1 className="text-sm font-bold leading-none" style={{ color: 'var(--foreground)' }}>
                {SECTIONS.find((s) => s.id === active)?.label ?? 'Dashboard'}
              </h1>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--foreground-secondary)' }} title={currentUserEmail}>
                {currentUserEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Toggle — Pill button matching the website's navbar design */}
            {active !== 'overview' && active !== 'cv' && active !== 'github' && active !== 'social' && active !== 'skills' && (
              <button
                onClick={() => setActiveLang(activeLang === 'en' ? 'ar' : 'en')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold glass-card hover:border-[--primary-accent] hover:text-[--primary-accent] transition-all"
                style={{ color: 'var(--foreground)' }}
                title="Toggle editing language (English / العربية)"
              >
                <Globe size={13} style={{ color: 'var(--primary-accent)' }} />
                <span>{activeLang === 'en' ? 'العربية' : 'English'}</span>
              </button>
            )}

            {active !== 'overview' && active !== 'github' && (
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white gradient-bg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saveStatus === 'saving' ? <Loader2 size={12} className="animate-spin" />
                  : saveStatus === 'saved' ? <Check size={12} />
                  : <Save size={12} />}
                {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Save'}
              </button>
            )}
            <a
              href="/" target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs glass-card hover:border-[--primary-accent] transition-colors"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              <ExternalLink size={12} />Preview
            </a>
          </div>
        </header>

        {/* Mobile nav drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-b overflow-hidden"
              style={{ borderColor: 'var(--glass-border)', background: 'rgba(5,6,15,0.85)' }}
            >
              <div className="flex flex-col gap-0.5 p-3">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setActive(s.id); setSidebarOpen(false) }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-start"
                    style={{
                      background: active === s.id ? 'color-mix(in srgb, var(--primary-accent) 14%, transparent)' : 'transparent',
                      color: active === s.id ? 'var(--primary-accent)' : 'var(--foreground-secondary)',
                    }}
                  >
                    {s.icon}{s.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {active === 'overview' && <OverviewPanel en={currentLangContent} onLogout={handleLogout} loggingOut={loggingOut} />}
              {active === 'hero'     && <HeroEditor     en={currentLangContent} updateEn={updateLang} updateBoth={updateBoth} saveStatus={saveStatus} onSave={handleSave} />}
              {active === 'about'    && <AboutEditor    en={currentLangContent} updateEn={updateLang} saveStatus={saveStatus} onSave={handleSave} />}
              {active === 'skills'   && <SkillsEditor   en={content.en} updateBoth={updateBoth} saveStatus={saveStatus} onSave={handleSave} />}
              {active === 'projects' && <ProjectsEditor content={content} updateBoth={updateBoth} updateEn={updateEnContent} updateAr={updateArContent} saveStatus={saveStatus} onSave={handleSave} />}
              {active === 'career'   && <CareerEditor   en={currentLangContent} updateBoth={updateLang} saveStatus={saveStatus} onSave={handleSave} />}
              {active === 'social'   && <SocialEditor   en={content.en} updateBoth={updateBoth} saveStatus={saveStatus} onSave={handleSave} />}
              {active === 'cv'       && <CVEditor       en={currentLangContent} updateBoth={updateBoth} saveStatus={saveStatus} onSave={handleSave} />}
              {active === 'github'   && <GitHubSettingsPanel en={currentLangContent} updateEn={updateLang} saveStatus={saveStatus} onSave={handleSave} />}
              {active === 'site'     && <SiteSettingsPanel en={currentLangContent} updateBoth={updateBoth} updateEn={updateLang} saveStatus={saveStatus} onSave={handleSave} />}
              {active === 'account'  && <AccountSection email={currentUserEmail} userId={currentUserId} onSecurityUpdate={checkSecurityStatus} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-card border border-[--glass-border] rounded-2xl p-6 shadow-2xl flex flex-col"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-4 shrink-0">
                <LogOut size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Sign out of Admin?
              </h3>
              <p className="text-sm text-[--foreground-secondary] leading-relaxed mb-6">
                Are you sure you want to sign out? You will need to sign in again to access the dashboard.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-white glass-card border border-[--glass-border] hover:border-[--foreground-secondary] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {loggingOut ? 'Signing out...' : 'Yes, log out'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Security Warning Modal */}
      <AnimatePresence>
        {showSecurityModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-card border border-[--glass-border] rounded-2xl p-6 shadow-2xl flex flex-col"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-4 shrink-0">
                <ShieldAlert size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Action Required</h3>
              <p className="text-sm text-[--foreground-secondary] leading-relaxed mb-6">
                Your account currently has no two-factor authentication (2FA) or email verification enabled. 
                Please enable at least one security measure.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowSecurityModal(false)
                    sessionStorage.setItem('securityWarningDismissed', 'true')
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-white glass-card border border-[--glass-border] hover:border-[--foreground-secondary] transition-colors"
                >
                  Later
                </button>
                <button
                  onClick={() => {
                    setShowSecurityModal(false)
                    sessionStorage.setItem('securityWarningDismissed', 'true')
                    setActive('account')
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-white gradient-bg hover:opacity-90 transition-opacity"
                >
                  Go to Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Overview ──────────────────────────────────────────────────────────────────
function OverviewPanel({ en, onLogout, loggingOut }: {
  en: LangContent; onLogout: () => void; loggingOut: boolean
}) {
  const githubConfigured = !!(en.github?.username || process.env.NEXT_PUBLIC_GITHUB_USERNAME)
  const stats = [
    { label: 'Projects',       value: en.projects.items.length,                 icon: <Code2 size={16} />,     color: '#7c5cfc' },
    { label: 'Career entries', value: en.career?.items?.length ?? 0,             icon: <Briefcase size={16} />, color: '#22d3ee' },
    { label: 'Skills',         value: en.skills.items?.length ?? 0,              icon: <Star size={16} />,      color: '#a78bfa' },
    { label: 'Social links',   value: en.social.links.filter(l => l.url).length, icon: <Users size={16} />,     color: '#34d399' },
    { label: 'GitHub',         value: githubConfigured ? 'On' : 'Off',           icon: <Github size={16} />,    color: githubConfigured ? '#22c55e' : '#888' },
    { label: 'Site visits',    value: '—',                                        icon: <Activity size={16} />,  color: '#f59e0b' },
  ]
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="glass-card rounded-2xl p-4 flex flex-col gap-3"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `color-mix(in srgb, ${s.color} 18%, transparent)`, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{s.value}</p>
              <p className="text-[11px]" style={{ color: 'var(--foreground-secondary)' }}>{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-5 flex items-start gap-3">
        <Activity size={15} style={{ color: 'var(--primary-accent)', marginTop: 2, flexShrink: 0 }} />
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>How it works</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
            Changes made in the editor are saved directly to the database.
            Use the language toggle in the top bar to edit Arabic and English independently.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { label: 'View portfolio',     icon: <ExternalLink size={13} />, href: '/' },
          { label: 'Browse all projects',icon: <Code2 size={13} />,       href: '/projects' },
          { label: 'View CV page',       icon: <FileText size={13} />,    href: '/cv' },
        ].map((item) => (
          <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
            className="glass-card rounded-xl p-4 flex items-center justify-between group hover:border-[--primary-accent] transition-colors">
            <div className="flex items-center gap-2.5" style={{ color: 'var(--foreground)' }}>
              <span style={{ color: 'var(--primary-accent)' }}>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <ExternalLink size={12} style={{ color: 'var(--foreground-secondary)' }} />
          </a>
        ))}
      </div>

      <button
        onClick={onLogout} disabled={loggingOut}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:text-red-400 disabled:opacity-50 self-start"
        style={{ color: 'var(--foreground-secondary)', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}
      >
        <LogOut size={14} />{loggingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}

// ── Hero editor ───────────────────────────────────────────────────────────────
function HeroEditor({ en, updateEn, updateBoth, saveStatus, onSave }: {
  en: LangContent; updateEn: (u: (d: LangContent) => void) => void
  updateBoth: (u: (d: LangContent) => void) => void
  saveStatus: SaveStatus; onSave: () => void
}) {
  const h = en.hero
  const set = (key: keyof HeroContent | 'avatar', val: string) =>
    updateEn((d) => { (d.hero as unknown as Record<string, unknown>)[key] = val })
  const setShared = (key: string, val: string) =>
    updateBoth((d) => { (d.hero as unknown as Record<string, unknown>)[key] = val })

  const [uploading, setUploading] = useState(false)

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <SaveBar status={saveStatus} onSave={onSave} />
      <div className="grid lg:grid-cols-2 gap-6 w-full items-start">
        <div className="flex flex-col gap-6 w-full">
          <SectionCard title="Identity">
            <Field label="Greeting" value={h.greeting} onChange={(v) => set('greeting', v)} />
            <Field label="Name" value={h.name} onChange={(v) => set('name', v)} />
            <Field label="Bio" value={h.bio} onChange={(v) => set('bio', v)} multiline />
          </SectionCard>

          <SectionCard title="Profile Photo & Avatar">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-[--primary-accent] glass-card flex items-center justify-center">
                {h.avatar || (h as any).image ? (
                  <img
                    src={h.avatar || (h as any).image}
                    alt={h.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} style={{ color: 'var(--foreground-secondary)' }} />
                )}
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer gradient-bg text-white hover:opacity-90 transition-opacity self-start">
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploading ? 'Uploading…' : 'Upload New Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setUploading(true)
                      const formData = new FormData()
                      formData.append('file', file)
                      try {
                        const res = await fetch('/api/admin-image-upload', {
                          method: 'POST',
                          body: formData,
                        })
                        const data = await res.json()
                        if (data.ok && data.url) {
                          setShared('avatar', data.url)
                        }
                      } catch (err) {
                        console.error('Image upload failed', err)
                      } finally {
                        setUploading(false)
                      }
                    }}
                  />
                </label>

                <Field
                  label="Or Photo URL"
                  value={h.avatar || (h as any).image || ''}
                  mono
                  onChange={(v) => setShared('avatar', v)}
                />
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <SectionCard title="Roles">
            <div className="flex flex-col gap-3">
              {(Array.isArray(h.roles) ? h.roles : []).map((role, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Field
                      label={`Role ${idx + 1}`}
                      value={role}
                      onChange={(v) => updateEn((d) => { d.hero.roles[idx] = v })}
                    />
                  </div>
                  <button
                    title="Delete Role"
                    onClick={() => updateEn((d) => { d.hero.roles.splice(idx, 1) })}
                    className="mt-5 p-2 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => updateEn((d) => { 
                  if (!Array.isArray(d.hero.roles)) d.hero.roles = []
                  d.hero.roles.push('New Role') 
                })}
                className="flex items-center gap-2 justify-center w-full py-3 rounded-xl border border-dashed border-[--glass-border] text-[--foreground-secondary] hover:text-[--primary-accent] hover:border-[--primary-accent] transition-colors mt-2 text-sm font-semibold"
              >
                <Plus size={16} /> Add Role
              </button>
            </div>
          </SectionCard>
          <SectionCard title="Call to action">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Primary label" value={h.cta_primary} onChange={(v) => set('cta_primary', v)} />
              <Field label="Primary href" value={h.cta_primary_href} onChange={(v) => set('cta_primary_href', v)} mono />
              <Field label="Secondary label" value={h.cta_secondary} onChange={(v) => set('cta_secondary', v)} />
              <Field label="Secondary href" value={h.cta_secondary_href} onChange={(v) => set('cta_secondary_href', v)} mono />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

// ── About editor ──────────────────────────────────────────────────────────────
function AboutEditor({ en, updateEn, saveStatus, onSave }: {
  en: LangContent; updateEn: (u: (d: LangContent) => void) => void
  saveStatus: SaveStatus; onSave: () => void
}) {
  const a = en.about
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <SaveBar status={saveStatus} onSave={onSave} />
      <SectionCard title="Labels">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Section label" value={a.section_label} onChange={(v) => updateEn((d) => { d.about.section_label = v })} />
          <Field label="Heading" value={a.heading} onChange={(v) => updateEn((d) => { d.about.heading = v })} />
        </div>
      </SectionCard>
      <div className="grid lg:grid-cols-3 gap-6 w-full items-start">
        <div className="lg:col-span-2">
          <SectionCard title="Bio paragraphs">
            {a.paragraphs.map((p, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Field label={`Paragraph ${i + 1}`} value={p} multiline
                    onChange={(v) => updateEn((d) => { d.about.paragraphs[i] = v })} />
                </div>
                <button onClick={() => updateEn((d) => { d.about.paragraphs.splice(i, 1) })}
                  className="mt-6 p-2 rounded-lg transition-colors hover:text-red-400"
                  style={{ color: 'var(--foreground-secondary)' }} aria-label="Remove paragraph">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button onClick={() => updateEn((d) => { d.about.paragraphs.push('') })}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium self-start transition-colors hover:text-[--primary-accent]"
              style={{ color: 'var(--foreground-secondary)', border: '1px dashed var(--glass-border)' }}>
              <Plus size={13} /> Add paragraph
            </button>
          </SectionCard>
        </div>
        <div className="lg:col-span-1">
          <SectionCard title="Stats">
            {a.stats.map((s, i) => (
              <div key={i} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Field label="Value" value={String(s.value)} onChange={(v) => updateEn((d) => { d.about.stats[i].value = v })} />
                </div>
                <div className="flex-1">
                  <Field label="Label" value={s.label} onChange={(v) => updateEn((d) => { d.about.stats[i].label = v })} />
                </div>
                <button onClick={() => updateEn((d) => { d.about.stats.splice(i, 1) })}
                  className="mb-0.5 p-2 rounded-lg transition-colors hover:text-red-400"
                  style={{ color: 'var(--foreground-secondary)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button onClick={() => updateEn((d) => { d.about.stats.push({ label: 'New Stat', value: '0' }) })}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium self-start transition-colors hover:text-[--primary-accent]"
              style={{ color: 'var(--foreground-secondary)', border: '1px dashed var(--glass-border)' }}>
              <Plus size={13} /> Add stat
            </button>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

// ── Skills editor ─────────────────────────────────────────────────────────────
function SkillsEditor({ en, updateBoth, saveStatus, onSave }: {
  en: LangContent; updateBoth: (u: (d: LangContent) => void) => void
  saveStatus: SaveStatus; onSave: () => void
}) {
  const POPULAR_ICONS = [
    // Frontend & Web
    { name: 'React', key: 'SiReact', color: '#61dafb', category: 'frontend' },
    { name: 'TypeScript', key: 'SiTypescript', color: '#3178c6', category: 'frontend' },
    { name: 'Next.js', key: 'SiNextdotjs', color: '#ffffff', category: 'frontend' },
    { name: 'JavaScript', key: 'SiJavascript', color: '#f7df1e', category: 'frontend' },
    { name: 'Tailwind CSS', key: 'SiTailwindcss', color: '#38bdf8', category: 'frontend' },
    { name: 'Vue.js', key: 'SiVuedotjs', color: '#41b883', category: 'frontend' },
    { name: 'Angular', key: 'SiAngular', color: '#dd0031', category: 'frontend' },
    { name: 'Svelte', key: 'SiSvelte', color: '#ff3e00', category: 'frontend' },
    { name: 'HTML5', key: 'SiHtml5', color: '#e34f26', category: 'frontend' },
    { name: 'CSS3', key: 'SiCss3', color: '#1572b6', category: 'frontend' },
    { name: 'Sass', key: 'SiSass', color: '#cc6699', category: 'frontend' },
    { name: 'Bootstrap', key: 'SiBootstrap', color: '#7952b3', category: 'frontend' },
    
    // Backend & Languages
    { name: 'Node.js', key: 'SiNodedotjs', color: '#6cc24a', category: 'backend' },
    { name: 'Python', key: 'SiPython', color: '#ffd343', category: 'backend' },
    { name: 'PHP', key: 'SiPhp', color: '#777bb4', category: 'backend' },
    { name: 'Laravel', key: 'SiLaravel', color: '#ff2d20', category: 'backend' },
    { name: 'Django', key: 'SiDjango', color: '#092e20', category: 'backend' },
    { name: 'FastAPI', key: 'SiFastapi', color: '#009688', category: 'backend' },
    { name: 'Go', key: 'SiGo', color: '#00add8', category: 'backend' },
    { name: 'Rust', key: 'SiRust', color: '#dea584', category: 'backend' },
    { name: 'C++', key: 'SiCplusplus', color: '#00599c', category: 'backend' },
    { name: 'C#', key: 'SiCsharp', color: '#239120', category: 'backend' },
    { name: 'GraphQL', key: 'SiGraphql', color: '#e535ab', category: 'backend' },

    // Database & Cloud & DevOps
    { name: 'PostgreSQL', key: 'SiPostgresql', color: '#336791', category: 'db' },
    { name: 'MongoDB', key: 'SiMongodb', color: '#47a248', category: 'db' },
    { name: 'MySQL', key: 'SiMysql', color: '#4479a1', category: 'db' },
    { name: 'Redis', key: 'SiRedis', color: '#dc382d', category: 'db' },
    { name: 'Supabase', key: 'SiSupabase', color: '#3ecf8e', category: 'db' },
    { name: 'Prisma', key: 'SiPrisma', color: '#5a67d8', category: 'db' },
    { name: 'Docker', key: 'SiDocker', color: '#2496ed', category: 'db' },
    { name: 'Kubernetes', key: 'SiKubernetes', color: '#326ce5', category: 'db' },
    { name: 'AWS', key: 'AwsIcon', color: '#ff9900', category: 'db' },
    { name: 'Firebase', key: 'SiFirebase', color: '#ffca28', category: 'db' },
    { name: 'Vercel', key: 'SiVercel', color: '#888888', category: 'db' },

    // Mobile & Desktop & Tools
    { name: 'Flutter', key: 'SiFlutter', color: '#02569b', category: 'mobile' },
    { name: 'Android', key: 'SiAndroid', color: '#3ddc84', category: 'mobile' },
    { name: 'Apple / iOS', key: 'SiApple', color: '#ffffff', category: 'mobile' },
    { name: 'Figma', key: 'SiFigma', color: '#a259ff', category: 'design' },
    { name: 'Git', key: 'SiGit', color: '#f05032', category: 'other' },
    { name: 'Linux', key: 'SiLinux', color: '#fcc624', category: 'other' },
    { name: 'Desktop App', key: 'FaDesktop', color: '#38bdf8', category: 'design' },
    { name: 'Code', key: 'FaCode', color: '#7c5cfc', category: 'other' },
    { name: 'Laptop / PC', key: 'FaLaptopCode', color: '#3ecf8e', category: 'other' },
    { name: 'Database', key: 'FaDatabase', color: '#f59e0b', category: 'db' },
    { name: 'Server', key: 'FaServer', color: '#a259ff', category: 'db' },
    { name: 'Mobile', key: 'FaMobile', color: '#e4405f', category: 'mobile' },
  ]

  const CATEGORIES = [
    { key: 'frontend', label: 'Frontend' },
    { key: 'backend', label: 'Backend' },
    { key: 'db', label: 'Database & DevOps' },
    { key: 'mobile', label: 'Mobile Apps' },
    { key: 'design', label: 'Design & Tools' },
    { key: 'testing', label: 'Testing' },
    { key: 'ai', label: 'AI & ML' },
    { key: 'other', label: 'Other' },
  ]

  const COLOR_PRESETS = [
    '#61dafb', '#3178c6', '#38bdf8', '#6cc24a', '#ffd343',
    '#336791', '#3ecf8e', '#a259ff', '#f05032', '#dc382d', '#ffffff',
  ]

  const [activePickerIdx, setActivePickerIdx] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <SaveBar status={saveStatus} onSave={onSave} />

      {/* Icon Guide */}
      <div className="glass-card rounded-2xl p-4 border border-[--glass-border] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-1.5" style={{ color: 'var(--foreground)' }}>
            <Star size={16} style={{ color: 'var(--primary-accent)' }} />
            How to add Icons?
          </h3>
          <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--foreground-secondary)' }}>
            Click <strong style={{ color: 'var(--foreground)' }}>💡 Pick Icon...</strong> inside any skill below to choose from popular options. 
            To use a custom icon, search for it on <a href="https://react-icons.github.io/react-icons/" target="_blank" rel="noopener noreferrer" className="text-[--primary-accent] hover:underline font-semibold">React Icons <ExternalLink size={10} className="inline mb-0.5" /></a>, copy its name (e.g., <code>SiReact</code>), and paste it into the <strong>Icon Key</strong> field. 
            <br/><span className="text-gray-400 mt-1 block">💡 <strong>Supported Libraries:</strong> Simple Icons (<code>Si</code>), FontAwesome 6 (<code>Fa</code>), Tabler (<code>Tb</code>), BoxIcons (<code>Bi</code>), Radix (<code>Rx</code>), Lucide (<code>Lu</code>), and Material Design (<code>Md</code>).</span>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start w-full">
        <div className="lg:col-span-1">
          <SectionCard title="Section labels">
            <div className="flex flex-col gap-3">
              <Field label="Section label" value={en.skills.section_label}
                onChange={(v) => updateBoth((d) => { d.skills.section_label = v })} />
              <Field label="Heading" value={en.skills.heading}
                onChange={(v) => updateBoth((d) => { d.skills.heading = v })} />
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-2">
          <SectionCard title="Skills (Full Customization)">
            <button onClick={() => updateBoth((d) => { d.skills.items.unshift({ name: 'New Skill', icon: 'SiReact', category: 'frontend', color: '#61dafb', is_primary: false }) })}
              className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold w-full justify-center transition-colors hover:bg-white/10 hover:text-white"
              style={{ color: 'var(--primary-accent)', border: '1px dashed var(--primary-accent)' }}>
              <Plus size={14} /> Add new skill
            </button>
            <div className="flex flex-col gap-4">
              {en.skills.items.map((skill, i) => (
                <div key={i} className="glass-card rounded-2xl p-4 flex flex-col gap-3 border border-[--glass-border]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--glass-border)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                        <DynamicIcon name={skill.icon} size={16} style={{ color: skill.color || '#61dafb' }} />
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{skill.name || 'New Skill'}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={skill.is_primary ?? false}
                          onChange={(e) => updateBoth((d) => { d.skills.items[i].is_primary = e.target.checked })}
                          className="accent-[--primary-accent] w-3.5 h-3.5"
                        />
                        <span className="text-xs font-medium" style={{ color: 'var(--foreground-secondary)' }}>Featured</span>
                      </label>
                      <button
                        onClick={() => updateBoth((d) => { d.skills.items.splice(i, 1) })}
                        className="p-1.5 rounded-lg transition-colors hover:text-red-400"
                        style={{ color: 'var(--foreground-secondary)' }}
                        title="Remove skill"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Skill Name" value={skill.name}
                      onChange={(v) => updateBoth((d) => { d.skills.items[i].name = v })} />
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground-secondary)' }}>
                          Icon Key
                        </label>
                        <button
                          onClick={() => setActivePickerIdx(activePickerIdx === i ? null : i)}
                          className="text-[11px] font-semibold text-[--primary-accent] hover:underline"
                        >
                          {activePickerIdx === i ? 'Close Picker' : '💡 Pick Icon...'}
                        </button>
                      </div>
                      <Field label="" value={skill.icon} mono
                        onChange={(v) => updateBoth((d) => { d.skills.items[i].icon = v.replace(/<|>|\/|\s|import|from|react-icons/gi, '').trim() })} />

                      {/* Icon Picker Modal */}
                      {activePickerIdx === i && (
                        <div 
                          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                          onClick={() => setActivePickerIdx(null)}
                        >
                          <div 
                            className="w-full max-w-xl bg-[#05060f] rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col gap-5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                              <h3 className="text-sm font-semibold text-white">Select an Icon for <span className="text-[--primary-accent]">{skill.name || 'New Skill'}</span></h3>
                              <button onClick={() => setActivePickerIdx(null)} className="text-xs px-4 py-2 rounded-xl glass-card hover:text-red-400 transition-colors border border-white/10">
                                Close
                              </button>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                              {POPULAR_ICONS.map((pIcon) => (
                                <button
                                  key={pIcon.key}
                                  onClick={() => {
                                    updateBoth((d) => {
                                      d.skills.items[i].icon = pIcon.key
                                      if (!d.skills.items[i].name || d.skills.items[i].name === 'New Skill') {
                                        d.skills.items[i].name = pIcon.name
                                      }
                                      d.skills.items[i].color = pIcon.color
                                      if (pIcon.category) {
                                        d.skills.items[i].category = pIcon.category
                                      }
                                    })
                                    setActivePickerIdx(null)
                                  }}
                                  className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white/10 transition-colors text-center border border-transparent hover:border-white/10"
                                  title={pIcon.name}
                                >
                                  <DynamicIcon name={pIcon.key} size={24} style={{ color: pIcon.color }} />
                                  <span className="text-[10px] font-medium truncate w-full mt-2 text-gray-300">{pIcon.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
                        Category
                      </label>
                      <select
                        value={skill.category || 'frontend'}
                        onChange={(e) => updateBoth((d) => { d.skills.items[i].category = e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-xs font-medium glass-card focus:outline-none focus:border-[--primary-accent]"
                        style={{ color: 'var(--foreground)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.key} value={cat.key} style={{ background: '#0d1020', color: '#fff' }}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
                        Accent Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={skill.color || '#61dafb'}
                          onChange={(e) => updateBoth((d) => { d.skills.items[i].color = e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                        />
                        <div className="flex-1">
                          <Field
                            label=""
                            value={skill.color || '#61dafb'}
                            mono
                            onChange={(v) => updateBoth((d) => { d.skills.items[i].color = v })}
                          />
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {COLOR_PRESETS.slice(0, 5).map((c) => (
                            <button
                              key={c}
                              onClick={() => updateBoth((d) => { d.skills.items[i].color = c })}
                              className="w-4 h-4 rounded-full transition-transform hover:scale-125"
                              style={{ background: c, border: '1px solid rgba(255,255,255,0.2)' }}
                              title={`Set color ${c}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

// ── GitHub repo picker for auto-fill ─────────────────────────────────────────
interface GHRepo {
  id: number; name: string; description: string | null
  html_url: string; homepage: string | null
  stargazers_count: number; language: string | null; topics: string[]
}

function GitHubImportPicker({ username, token, onSelect, onClose }: {
  username?: string; token?: string; onSelect: (r: GHRepo) => void; onClose: () => void
}) {
  const [repos, setRepos]     = useState<GHRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')

  useEffect(() => {
    const qParams = username ? `?username=${encodeURIComponent(username)}${token ? `&token=${encodeURIComponent(token)}` : ''}` : ''
    fetch(`/api/admin-github${qParams}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); setLoading(false); return }
        setRepos(d.repos ?? [])
        setLoading(false)
      })
      .catch(() => { setError('Network error'); setLoading(false) })
  }, [username, token])

  const filtered = repos.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg glass-card rounded-3xl p-5 flex flex-col gap-4"
        style={{ maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Import from GitHub
          </p>
          <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-xl glass-card hover:text-red-400 transition-colors"
            style={{ color: 'var(--foreground-secondary)' }}>
            Cancel
          </button>
        </div>

        <input
          type="text" placeholder="Search repos…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--foreground)' }}
        />

        <div className="flex flex-col gap-2 overflow-y-auto flex-1">
          {loading && <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin" style={{ color: 'var(--primary-accent)' }} /></div>}
          {error && <p className="text-xs text-center py-4" style={{ color: '#ef4444' }}>{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: 'var(--foreground-secondary)' }}>No repos found. Check GITHUB_USERNAME in GitHub Settings.</p>
          )}
          {filtered.map((repo) => (
            <button
              key={repo.id}
              onClick={() => onSelect(repo)}
              className="glass-card rounded-2xl p-4 text-start hover:border-[--primary-accent] transition-colors flex flex-col gap-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{repo.name}</span>
                {repo.language && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full glass-card" style={{ color: 'var(--foreground-secondary)' }}>
                    {repo.language}
                  </span>
                )}
              </div>
              {repo.description && (
                <p className="text-xs line-clamp-2" style={{ color: 'var(--foreground-secondary)' }}>
                  {repo.description}
                </p>
              )}
              {repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {repo.topics.slice(0, 4).map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md"
                      style={{ background: 'color-mix(in srgb, var(--primary-accent) 14%, transparent)', color: 'var(--primary-accent)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// ── Projects editor ───────────────────────────────────────────────────────────
function ProjectsEditor({ content, updateBoth, updateEn, updateAr, saveStatus, onSave }: {
  content: ContentJSON; updateBoth: (u: (d: LangContent) => void) => void
  updateEn: (u: (d: LangContent) => void) => void
  updateAr: (u: (d: LangContent) => void) => void
  saveStatus: SaveStatus; onSave: () => void
}) {
  const [expanded,    setExpanded]    = useState<number | null>(0)
  const [showPicker,  setShowPicker]  = useState(false)
  const [importIndex, setImportIndex] = useState<number | null>(null)

  function handleImport(repo: GHRepo, idx: number) {
    const currentUsername = content.en.github?.username?.trim() || ''
    updateBoth((d) => {
      const p = d.projects.items[idx]
      p.title         = repo.name
      p.description   = repo.description || `Project ${repo.name} built with ${repo.language || 'modern web technologies'}.`
      p.category      = repo.language ? repo.language : 'web'
      
      const allTags = [repo.language, ...(repo.topics || [])].filter(Boolean) as string[]
      p.tags          = Array.from(new Set(allTags))
      
      const userRepoUrl = `https://github.com/${currentUsername}/${repo.name}`
      p.secondaryLink = { url: userRepoUrl }
      p.primaryLink   = { url: repo.homepage || userRepoUrl }
    })
    setShowPicker(false)
    setImportIndex(null)
  }

  const en = content.en

  return (
    <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto">
      <SaveBar status={saveStatus} onSave={onSave} />

      <div className="flex flex-col gap-2">
        {en.projects.items.map((pEn, i) => {
          const pAr = content.ar.projects.items[i] || pEn // Fallback just in case

          return (
            <div key={i} className="glass-card rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-start"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: 'color-mix(in srgb, var(--primary-accent) 14%, transparent)', color: 'var(--primary-accent)' }}>
                    {pEn.category}
                  </span>
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {pEn.title} {pAr.title !== pEn.title && <span className="opacity-50 text-xs ml-2">/ {pAr.title}</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {pEn.featured && <Star size={12} style={{ color: '#f59e0b' }} />}
                  {expanded === i
                    ? <ChevronUp size={15} style={{ color: 'var(--foreground-secondary)' }} />
                    : <ChevronDown size={15} style={{ color: 'var(--foreground-secondary)' }} />}
                </div>
              </button>

              <AnimatePresence>
                {expanded === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="flex flex-col gap-4 px-5 pb-5 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                      <div className="h-1" />

                      {/* GitHub auto-fill button */}
                      <button
                        onClick={() => { setImportIndex(i); setShowPicker(true) }}
                        className="self-start flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors hover:text-[--primary-accent]"
                        style={{ color: 'var(--foreground-secondary)', border: '1px solid var(--glass-border)' }}
                      >
                        <Github size={13} /> Import from GitHub
                      </button>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <p className="text-xs font-bold text-[--primary-accent] uppercase tracking-wider">English</p>
                          <Field label="Title" value={pEn.title}
                            onChange={(v) => updateEn((d) => { d.projects.items[i].title = v })} />
                          <Field label="Description" value={pEn.description} multiline
                            onChange={(v) => updateEn((d) => { d.projects.items[i].description = v })} />
                        </div>

                        <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <p className="text-xs font-bold text-[--primary-accent] uppercase tracking-wider">العربية</p>
                          <Field label="Title" value={pAr.title} dir="rtl"
                            onChange={(v) => updateAr((d) => { d.projects.items[i].title = v })} />
                          <Field label="Description" value={pAr.description} multiline dir="rtl"
                            onChange={(v) => updateAr((d) => { d.projects.items[i].description = v })} />
                        </div>
                      </div>

                      <div className="h-px w-full my-2" style={{ background: 'var(--glass-border)' }} />

                      <div className="grid md:grid-cols-2 gap-3">
                        <Field label="Category (Shared)" value={pEn.category}
                          onChange={(v) => updateBoth((d) => { d.projects.items[i].category = v })} />
                        <Field label="Tags (Shared, comma-separated)" value={pEn.tags.join(', ')}
                          onChange={(v) => updateBoth((d) => { d.projects.items[i].tags = v.split(',').map(t => t.trim()).filter(Boolean) })} />
                      </div>

                      <Field label="Image path (Shared)" value={pEn.image} mono
                        onChange={(v) => updateBoth((d) => { d.projects.items[i].image = v })} />
                      
                      <div className="grid md:grid-cols-2 gap-3">
                        <Field label="Live URL (Shared)" value={pEn.primaryLink?.url ?? ''} mono
                          onChange={(v) => updateBoth((d) => { d.projects.items[i].primaryLink = { url: v } })} />
                        <Field label="GitHub URL (Shared)" value={pEn.secondaryLink?.url ?? ''} mono
                          onChange={(v) => updateBoth((d) => { d.projects.items[i].secondaryLink = { url: v } })} />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={pEn.featured}
                            onChange={(e) => updateBoth((d) => { d.projects.items[i].featured = e.target.checked })}
                            className="accent-[--primary-accent] w-4 h-4" />
                          <span className="text-xs font-medium" style={{ color: 'var(--foreground-secondary)' }}>
                            Featured on homepage (Shared)
                          </span>
                        </label>
                        <button
                          onClick={() => { updateBoth((d) => { d.projects.items.splice(i, 1) }); setExpanded(null) }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-colors hover:text-red-400"
                          style={{ color: 'var(--foreground-secondary)', border: '1px solid var(--glass-border)' }}>
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => {
          updateBoth((d) => {
            d.projects.items.push({
              title: 'New Project', description: '', image: '/images/project-placeholder.png',
              tags: [], category: 'web', featured: false,
              primaryLink: { url: '' }, secondaryLink: { url: '' },
            })
          })
          setExpanded(en.projects.items.length)
        }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium self-start transition-colors hover:text-[--primary-accent]"
        style={{ color: 'var(--foreground-secondary)', border: '1px dashed var(--glass-border)' }}
      >
        <Plus size={14} /> Add project
      </button>

      <AnimatePresence>
        {showPicker && importIndex !== null && (
          <GitHubImportPicker
            username={en.github?.username}
            onSelect={(repo) => handleImport(repo, importIndex)}
            onClose={() => { setShowPicker(false); setImportIndex(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Career editor ─────────────────────────────────────────────────────────────
function CareerEditor({ en, updateBoth, saveStatus, onSave }: {
  en: LangContent; updateBoth: (u: (d: LangContent) => void) => void
  saveStatus: SaveStatus; onSave: () => void
}) {
  const items = en.career?.items ?? []
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <SaveBar status={saveStatus} onSave={onSave} />
      <div className="grid lg:grid-cols-2 gap-4 w-full">
        {items.map((item, i) => (
          <div key={i} className="glass-card rounded-2xl overflow-hidden self-start">
            <button onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-start">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{item.role}</p>
                <p className="text-xs truncate" style={{ color: 'var(--foreground-secondary)' }}>
                  {item.company} · {item.startDate}–{item.endDate}
                </p>
              </div>
              {expanded === i
                ? <ChevronUp size={15} style={{ color: 'var(--foreground-secondary)' }} />
                : <ChevronDown size={15} style={{ color: 'var(--foreground-secondary)' }} />}
            </button>
            <AnimatePresence>
              {expanded === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}
                >
                  <div className="flex flex-col gap-3 px-5 pb-5 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                    <div className="h-3" />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Role / Title" value={item.role}
                        onChange={(v) => updateBoth((d) => { d.career.items[i].role = v })} />
                      <Field label="Company" value={item.company}
                        onChange={(v) => updateBoth((d) => { d.career.items[i].company = v })} />
                      <Field label="Start date" value={item.startDate}
                        onChange={(v) => updateBoth((d) => { d.career.items[i].startDate = v })} />
                      <Field label="End date" value={item.endDate}
                        onChange={(v) => updateBoth((d) => { d.career.items[i].endDate = v })} />
                    </div>
                    <Field label="Description" value={item.description} multiline
                      onChange={(v) => updateBoth((d) => { d.career.items[i].description = v })} />
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => { updateBoth((d) => { d.career.items.splice(i, 1) }); setExpanded(null) }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-colors hover:text-red-400"
                        style={{ color: 'var(--foreground-secondary)', border: '1px solid var(--glass-border)' }}>
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          updateBoth((d) => { d.career.items.push({ role: 'New Role', company: 'Company', startDate: '2024', endDate: 'Present', description: '' }) })
          setExpanded(items.length)
        }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium self-start transition-colors hover:text-[--primary-accent]"
        style={{ color: 'var(--foreground-secondary)', border: '1px dashed var(--glass-border)' }}
      >
        <Plus size={14} /> Add entry
      </button>
    </div>
  )
}

// ── Social links editor ───────────────────────────────────────────────────────
function SocialEditor({ en, updateBoth, saveStatus, onSave }: {
  en: LangContent; updateBoth: (u: (d: LangContent) => void) => void
  saveStatus: SaveStatus; onSave: () => void
}) {
  const PRESET_PLATFORMS = [
    { platform: 'GitHub', icon: 'FaGithub', color: '#7c5cfc' },
    { platform: 'LinkedIn', icon: 'FaLinkedin', color: '#0a66c2' },
    { platform: 'Twitter / X', icon: 'FaXTwitter', color: '#1da1f2' },
    { platform: 'Instagram', icon: 'FaInstagram', color: '#e4405f' },
    { platform: 'WhatsApp', icon: 'FaWhatsapp', color: '#25d366' },
    { platform: 'Email', icon: 'FaEnvelope', color: '#ea4335' },
    { platform: 'YouTube', icon: 'FaYoutube', color: '#ff0000' },
    { platform: 'Discord', icon: 'FaDiscord', color: '#5865f2' },
    { platform: 'Telegram', icon: 'FaTelegram', color: '#24a1de' },
    { platform: 'ResearchGate', icon: 'SiResearchgate', color: '#00ccbb' },
  ]

  function addPresetLink(item: { platform: string; icon: string; color: string }) {
    updateBoth((d) => {
      const exists = d.social.links.some(l => l.platform.toLowerCase() === item.platform.toLowerCase())
      if (!exists) {
        d.social.links.push({
          platform: item.platform,
          url: '',
          color: item.color,
          icon: item.icon,
        })
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <SaveBar status={saveStatus} onSave={onSave} />

      {/* Quick Add Presets Reference card */}
      <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 border border-[--glass-border]">
        <div className="flex items-center gap-2">
          <Star size={16} style={{ color: 'var(--primary-accent)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Available Social Platforms Reference (Click to Add)
          </h3>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
          Click any social platform below to add it instantly to your links panel:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {PRESET_PLATFORMS.map((item) => (
            <button
              key={item.platform}
              onClick={() => addPresetLink(item)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all hover:border-[--primary-accent] hover:scale-[1.02] text-start"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--foreground)',
              }}
            >
              <DynamicIcon name={item.icon} size={15} style={{ color: item.color, flexShrink: 0 }} />
              <span className="truncate flex-1 font-medium">{item.platform}</span>
              <Plus size={12} style={{ color: 'var(--primary-accent)', flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Info badge */}
      <div className="glass-card rounded-xl px-4 py-3 flex items-start gap-2 w-full">
        <Activity size={13} style={{ color: 'var(--primary-accent)', marginTop: 1, flexShrink: 0 }} />
        <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
          Leave the URL blank to hide a platform from the site. It will still be saved here for later.
        </p>
      </div>

      <SectionCard title="Social links">
        <div className="grid md:grid-cols-2 gap-4 w-full">
          {en.social.links.map((link, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 flex flex-col gap-3 border border-[--glass-border]">
              <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: 'var(--glass-border)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--glass-border)' }}>
                    <DynamicIcon name={link.icon || 'FaGlobe'} size={16} style={{ color: link.color || 'var(--primary-accent)' }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{link.platform || 'Social Link'}</span>
                </div>

                <div className="flex items-center gap-1">
                  {link.url && (
                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg transition-colors hover:text-[--primary-accent]"
                      style={{ color: 'var(--foreground-secondary)' }} aria-label={`Open ${link.platform}`}>
                      <LinkIcon size={14} />
                    </a>
                  )}
                  <button onClick={() => updateBoth((d) => { d.social.links.splice(i, 1) })}
                    className="p-1.5 rounded-lg transition-colors hover:text-red-400"
                    style={{ color: 'var(--foreground-secondary)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Platform" value={link.platform}
                  onChange={(v) => updateBoth((d) => { d.social.links[i].platform = v })} />
                
                <Field label="Icon Key (e.g. FaGithub, FaLinkedin)" value={link.icon || ''} mono
                  onChange={(v) => updateBoth((d) => { d.social.links[i].icon = v.replace(/<|>|\/|\s|import|from|react-icons/gi, '').trim() })} />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="URL (Profile Link)" value={link.url} mono
                  onChange={(v) => updateBoth((d) => { d.social.links[i].url = v })} />
                
                <Field label="Accent Color (e.g. #0a66c2)" value={link.color} mono
                  onChange={(v) => updateBoth((d) => { d.social.links[i].color = v })} />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => updateBoth((d) => { d.social.links.push({ platform: 'New', url: '', color: '#ffffff', icon: 'FaGlobe' }) })}
          className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium self-start transition-colors hover:text-[--primary-accent]"
          style={{ color: 'var(--foreground-secondary)', border: '1px dashed var(--glass-border)' }}>
          <Plus size={13} /> Add custom link
        </button>
      </SectionCard>
    </div>
  )
}

// ── CV Files editor ───────────────────────────────────────────────────────────
function CVFileUpload({ locale, currentPath, onUploaded }: {
  locale: 'en' | 'ar'; currentPath: string; onUploaded: (path: string) => void
}) {
  const [state, setState]   = useState<UploadState>('idle')
  const [msg, setMsg]       = useState('')
  const inputRef            = useRef<HTMLInputElement>(null)
  const accentColor         = locale === 'en' ? '#7c5cfc' : '#22d3ee'

  async function handleFile(file: File) {
    if (!file) return
    setState('uploading')
    const form = new FormData()
    form.append('file', file)
    form.append('locale', locale)
    try {
      const res  = await fetch('/api/admin-upload', { method: 'POST', body: form })
      const data = await res.json()
      if (res.ok) {
        setState('done'); setMsg('Uploaded successfully ✓')
        onUploaded(data.path)
        setTimeout(() => setState('idle'), 3000)
      } else {
        setState('error'); setMsg(data.error ?? 'Upload failed')
      }
    } catch {
      setState('error'); setMsg('Network error')
    }
  }

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4"
      style={{ borderColor: `color-mix(in srgb, ${accentColor} 25%, var(--glass-border))` }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `color-mix(in srgb, ${accentColor} 18%, transparent)`, color: accentColor }}>
            <FileText size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              {locale === 'en' ? 'English Resume' : 'Arabic Resume'}
            </p>
            <p className="text-[11px] font-mono truncate max-w-[220px]" style={{ color: 'var(--foreground-secondary)' }} title={currentPath}>
              {currentPath.length > 30 ? '...' + currentPath.slice(-28) : currentPath}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={currentPath} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors hover:text-[--primary-accent]"
            style={{ color: 'var(--foreground-secondary)', border: '1px solid var(--glass-border)' }}>
            <Eye size={12} /> Preview
          </a>
          <a href={currentPath} download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors hover:text-[--primary-accent]"
            style={{ color: 'var(--foreground-secondary)', border: '1px solid var(--glass-border)' }}>
            <Download size={12} /> Download
          </a>
        </div>
      </div>

      <div
        className="relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-8 gap-2 cursor-pointer transition-colors hover:border-[--primary-accent]"
        style={{ borderColor: state === 'uploading' ? accentColor : 'var(--glass-border)' }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
      >
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        {state === 'uploading' && <Loader2 size={22} className="animate-spin" style={{ color: accentColor }} />}
        {state === 'done'      && <Check size={22} style={{ color: '#22c55e' }} />}
        {state === 'error'     && <AlertCircle size={22} style={{ color: '#ef4444' }} />}
        {state === 'idle'      && <Upload size={22} style={{ color: 'var(--foreground-secondary)' }} />}
        <p className="text-xs text-center" style={{ color: state === 'error' ? '#ef4444' : 'var(--foreground-secondary)' }}>
          {state === 'idle'      && <><span className="font-semibold" style={{ color: accentColor }}>Click to upload</span> or drag & drop<br />PDF only · max 10 MB</>}
          {state === 'uploading' && 'Uploading…'}
          {state === 'done'      && msg}
          {state === 'error'     && msg}
        </p>
      </div>

      {state === 'error' && (
        <button onClick={() => setState('idle')}
          className="flex items-center gap-1.5 text-xs self-start transition-colors hover:text-[--primary-accent]"
          style={{ color: 'var(--foreground-secondary)' }}>
          <RefreshCw size={11} /> Try again
        </button>
      )}
    </div>
  )
}

function CVEditor({ en, updateBoth, saveStatus, onSave }: {
  en: LangContent; updateBoth: (u: (d: LangContent) => void) => void
  saveStatus: SaveStatus; onSave: () => void
}) {
  const cv = en.cv
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <SaveBar status={saveStatus} onSave={onSave} />
      <SectionCard title="CV file paths">
        <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
          Upload new PDFs using the drop zones below — they replace the files on disk immediately. Edit the paths if you host files elsewhere.
        </p>
        <div className="grid md:grid-cols-2 gap-4 w-full">
          <Field label="English CV path" value={cv?.en ?? '/cv/resume-en.pdf'} mono
            onChange={(v) => updateBoth((d) => { d.cv.en = v })} />
          <Field label="Arabic CV path" value={cv?.ar ?? '/cv/resume-ar.pdf'} mono
            onChange={(v) => updateBoth((d) => { d.cv.ar = v })} />
        </div>
      </SectionCard>

      <div className="grid md:grid-cols-2 gap-6 w-full">
        <CVFileUpload locale="en" currentPath={cv?.en ?? '/cv/resume-en.pdf'}
          onUploaded={(path) => updateBoth((d) => { d.cv.en = path })} />
        <CVFileUpload locale="ar" currentPath={cv?.ar ?? '/cv/resume-ar.pdf'}
          onUploaded={(path) => updateBoth((d) => { d.cv.ar = path })} />
      </div>
    </div>
  )
}

// ── GitHub Settings panel ─────────────────────────────────────────────────────
function GitHubSettingsPanel({ en, updateEn, saveStatus, onSave }: {
  en: LangContent
  updateEn: (u: (d: LangContent) => void) => void
  saveStatus: SaveStatus
  onSave: () => void
}) {
  const [username, setUsername] = useState(en.github?.username ?? '')
  // Token is used for the connection test only; it is never saved (content is public). Use GITHUB_TOKEN env.
  const [token,    setToken]    = useState('')
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')
  const [testMsg,    setTestMsg]    = useState('')
  const [repoCount,  setRepoCount]  = useState<number | null>(null)

  // Sync if en.github changes (e.g. after initial load)
  useEffect(() => {
    if (en.github?.username && !username) setUsername(en.github.username)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [en.github])

  const isSaved = en.github?.username === username

  function handleUsernameChange(v: string) {
    setUsername(v)
    setTestStatus('idle'); setTestMsg('')
  }
  function handleTokenChange(v: string) {
    setToken(v)
    setTestStatus('idle'); setTestMsg('')
  }

  async function testConnection() {
    if (!username.trim()) { setTestMsg('Enter a username first'); setTestStatus('error'); return }
    setTestStatus('testing'); setTestMsg(''); setRepoCount(null)
    try {
      const res  = await fetch(`/api/admin-github?username=${encodeURIComponent(username.trim())}${token ? `&token=${encodeURIComponent(token)}` : ''}`)
      const data = await res.json()
      if (data.ok) {
        setTestStatus('ok')
        setTestMsg(`Connected — ${data.count} public repositories found.`)
        setRepoCount(data.count)
      } else {
        setTestStatus('error'); setTestMsg(data.error ?? 'Connection failed')
      }
    } catch {
      setTestStatus('error'); setTestMsg('Network error')
    }
  }

  function saveCredentials() {
    updateEn((d) => {
      d.github = { username: username.trim() }
    })
    // Trigger the global content.json save immediately
    onSave()
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="glass-card rounded-2xl p-5 flex items-start gap-3 w-full">
        <Github size={15} style={{ color: 'var(--primary-accent)', marginTop: 2, flexShrink: 0 }} />
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>GitHub Integration</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
            Test your username below, then click <strong>Save username</strong> to store it. The Projects editor will use it for GitHub auto-fill.
            Tokens are never stored in the database; set <code className="px-1 rounded bg-white/5">GITHUB_TOKEN</code> as a server environment variable instead.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 w-full items-start">
        <SectionCard title="Test connection">
          <Field label="GitHub Username" value={username} onChange={handleUsernameChange} />
          <Field label="GitHub Token (optional — used for this test only, never saved)" value={token} onChange={handleTokenChange} type="password" />

          <div className="flex flex-wrap items-center gap-3">
            {/* Test button */}
            <button
              onClick={testConnection}
              disabled={testStatus === 'testing'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white gradient-bg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {testStatus === 'testing' ? <Loader2 size={14} className="animate-spin" /> : <Github size={14} />}
              {testStatus === 'testing' ? 'Testing…' : 'Test Connection'}
            </button>

            {/* Save button — unlocked after a successful test or anytime username exists */}
            <button
              onClick={saveCredentials}
              disabled={!username.trim() || saveStatus === 'saving' || isSaved}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{
                background: isSaved
                  ? 'color-mix(in srgb, #22c55e 14%, transparent)'
                  : 'color-mix(in srgb, var(--primary-accent) 14%, transparent)',
                color: isSaved ? '#22c55e' : 'var(--primary-accent)',
                border: '1px solid',
                borderColor: isSaved ? 'color-mix(in srgb, #22c55e 35%, transparent)' : 'color-mix(in srgb, var(--primary-accent) 35%, transparent)',
              }}
            >
              {saveStatus === 'saving' ? <Loader2 size={14} className="animate-spin" /> : isSaved ? <Check size={14} /> : <Save size={14} />}
              {saveStatus === 'saving' ? 'Saving…' : isSaved ? 'Saved' : 'Save username'}
            </button>

            {/* Test result message */}
            <AnimatePresence>
              {testMsg && (
                <motion.p
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-xs font-medium w-full"
                  style={{ color: testStatus === 'ok' ? '#22c55e' : '#ef4444' }}
                >
                  {testStatus === 'ok' ? <Check size={13} /> : <AlertCircle size={13} />}
                  {testMsg}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Repos found badge */}
          <AnimatePresence>
            {repoCount !== null && testStatus === 'ok' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{ background: 'color-mix(in srgb, #22c55e 10%, transparent)', border: '1px solid color-mix(in srgb, #22c55e 25%, transparent)' }}
              >
                <Github size={13} style={{ color: '#22c55e' }} />
                <span className="text-xs font-medium" style={{ color: '#22c55e' }}>
                  <strong>{repoCount}</strong> public repositories accessible as{' '}
                  <strong>@{username}</strong> — ready to use in Projects auto-fill.
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </SectionCard>

        <div className="flex flex-col gap-6 w-full">
          {/* Saved credentials indicator */}
          {en.github?.username && (
            <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#22c55e' }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                  Saved
                </p>
                <p className="text-[11px]" style={{ color: 'var(--foreground-secondary)' }}>
                  Username: <strong>{en.github.username}</strong>
                </p>
              </div>
            </div>
          )}

          <SectionCard title="Environment variables (alternative)">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
              Set these as server environment variables (for example in Vercel). The token is only ever read from the environment.
            </p>
            {[
              { key: 'GITHUB_USERNAME', desc: 'Your GitHub username (e.g. octocat)', required: true },
              { key: 'GITHUB_TOKEN',    desc: 'Personal access token — read-only scope is enough', required: false },
            ].map((v) => (
              <div key={v.key} className="glass-card rounded-xl px-4 py-3 flex items-center justify-between gap-3 mb-2">
                <div>
                  <p className="text-xs font-mono font-semibold" style={{ color: 'var(--foreground)' }}>{v.key}</p>
                  <p className="text-[11px]" style={{ color: 'var(--foreground-secondary)' }}>{v.desc}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    background: v.required ? 'color-mix(in srgb, var(--primary-accent) 14%, transparent)' : 'color-mix(in srgb, #22c55e 12%, transparent)',
                    color: v.required ? 'var(--primary-accent)' : '#22c55e',
                  }}>
                  {v.required ? 'required' : 'optional'}
                </span>
              </div>
            ))}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

// ── Site Settings panel ───────────────────────────────────────────────────────
function SiteSettingsPanel({ en, updateBoth, updateEn, saveStatus, onSave }: {
  en: LangContent
  updateBoth: (u: (d: LangContent) => void) => void
  updateEn: (u: (d: LangContent) => void) => void
  saveStatus: SaveStatus
  onSave: () => void
}) {

  const [siteTab, setSiteTab] = useState<'brand' | 'seo' | 'footer' | 'other'>('brand')
  const [uploadingFav, setUploadingFav] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const meta = en.meta ?? {}
  const social = en.social ?? { links: [] }
  const nav = en.nav ?? {}
  const logoSettings = nav.logoSettings ?? {
    colorType: 'gradient',
    gradientStart: '#7c5cfc',
    gradientEnd: '#22d3ee',
    solidColor: '#7c5cfc',
    glowColor: '#7c5cfc',
    animation: 'gradient-flow'
  }
  const footer = en.footer ?? {}

  const updateLogoSetting = (key: string, value: any) => {
    updateEn((d) => {
      if (!d.nav) d.nav = {}
      if (!d.nav.logoSettings) {
        d.nav.logoSettings = {
          colorType: 'gradient',
          gradientStart: '#7c5cfc',
          gradientEnd: '#22d3ee',
          solidColor: '#7c5cfc',
          glowColor: '#7c5cfc',
          animation: 'gradient-flow'
        }
      }
      (d.nav.logoSettings as any)[key] = value
    })
  }

  async function handleLogoUpload(file: File) {
    setUploadingLogo(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/admin-image-upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.ok && data.url) {
        updateBoth((d) => {
          if (!d.nav) d.nav = {}
          if (!d.nav.logoSettings) {
            d.nav.logoSettings = {
              colorType: 'gradient',
              gradientStart: '#7c5cfc',
              gradientEnd: '#22d3ee',
              solidColor: '#7c5cfc',
              glowColor: '#7c5cfc',
              animation: 'gradient-flow'
            }
          }
          d.nav.logoSettings.logoImage = data.url
          d.nav.logoSettings.logoType = 'image'
        })
      }
    } catch (err) {
      console.error('Logo image upload failed:', err)
    } finally {
      setUploadingLogo(false)
    }
  }

  const applyPalette = (start: string, end: string, glow: string) => {
    updateEn((d) => {
      if (!d.nav) d.nav = {}
      d.nav.logoSettings = {
        ...(d.nav.logoSettings || {}),
        colorType: 'gradient',
        gradientStart: start,
        gradientEnd: end,
        glowColor: glow,
        solidColor: start
      }
    })
  }


  const getPreviewStyle = () => {
    const start = logoSettings.gradientStart || '#7c5cfc'
    const end = logoSettings.gradientEnd || '#22d3ee'
    const solid = logoSettings.solidColor || '#7c5cfc'
    const glow = logoSettings.glowColor || start

    const style: React.CSSProperties = {
      '--logo-glow': glow,
      '--logo-start': start,
      '--logo-end': end,
    } as React.CSSProperties

    if (logoSettings.colorType === 'solid') {
      style.color = solid
    } else {
      style.backgroundImage = `linear-gradient(135deg, ${start}, ${end})`
      style.WebkitBackgroundClip = 'text'
      style.WebkitTextFillColor = 'transparent'
      style.backgroundClip = 'text'
    }
    return style
  }

  const getPreviewAnimClass = () => {
    switch (logoSettings.animation) {
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
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Site Settings</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--foreground-secondary)' }}>
            Configure your brand identity, SEO, and global site preferences.
          </p>
        </div>
        <SaveBar status={saveStatus} onSave={onSave} />
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[--glass-border] overflow-x-auto pb-[1px]">
        {[
          { id: 'brand', label: 'Branding & Logo', icon: <Palette size={14} /> },
          { id: 'seo', label: 'SEO & Meta', icon: <Globe size={14} /> },
          { id: 'footer', label: 'Footer Settings', icon: <LayoutTemplate size={14} /> },
          { id: 'other', label: 'Other Settings', icon: <Settings size={14} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSiteTab(t.id as any)}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all relative ${
              siteTab === t.id 
                ? 'text-[--primary-accent]' 
                : 'text-[--foreground-secondary] hover:text-[--foreground]'
            }`}
          >
            {t.icon} {t.label}
            {siteTab === t.id && (
              <motion.div layoutId="siteTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--primary-accent]" />
            )}
          </button>
        ))}
      </div>

      <div className="w-full">
        {/* BRAND TAB */}
        {siteTab === 'brand' && (
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-6">
              <SectionCard title="Brand Logo">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-[--foreground-secondary]">Logo Display Mode</label>
                    <div className="flex items-center gap-2">
                      {[ { id: 'text', label: 'Text Logo' }, { id: 'image', label: 'Image Logo' } ].map((mode) => (
                        <button
                          key={mode.id} type="button" onClick={() => updateLogoSetting('logoType', mode.id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex-1"
                          style={{
                            background: (logoSettings.logoType ?? (logoSettings.logoImage ? 'image' : 'text')) === mode.id ? 'color-mix(in srgb, var(--primary-accent) 15%, transparent)' : 'var(--glass-bg)',
                            color: (logoSettings.logoType ?? (logoSettings.logoImage ? 'image' : 'text')) === mode.id ? 'var(--primary-accent)' : 'var(--foreground-secondary)',
                            border: `1px solid ${(logoSettings.logoType ?? (logoSettings.logoImage ? 'image' : 'text')) === mode.id ? 'var(--primary-accent)' : 'var(--glass-border)'}`
                          }}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(logoSettings.logoType ?? (logoSettings.logoImage ? 'image' : 'text')) === 'image' ? (
                    <div className="flex flex-col gap-2 p-4 rounded-xl glass-card border border-[--glass-border] bg-black/20">
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-[--foreground-secondary]">Upload Logo Image</label>
                      <div className="flex items-center gap-4">
                        {logoSettings.logoImage && (
                          <div className="w-16 h-16 rounded-xl glass-card border border-[--glass-border] flex items-center justify-center p-2 bg-[#05060f]">
                            <img src={logoSettings.logoImage} alt="Logo" className="max-h-full max-w-full object-contain" />
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer gradient-bg text-white hover:opacity-90 transition-opacity w-fit">
                            {uploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                            {uploadingLogo ? 'Uploading…' : (logoSettings.logoImage ? 'Replace Image' : 'Upload Image')}
                            <input type="file" accept="image/*" className="hidden" disabled={uploadingLogo} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleLogoUpload(file) }} />
                          </label>
                          {logoSettings.logoImage && (
                            <button type="button" onClick={() => { updateLogoSetting('logoImage', ''); updateLogoSetting('logoType', 'text') }} className="text-[11px] text-red-400 hover:text-red-300 transition-colors text-left font-semibold">
                              Remove Image
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Field label="Header Logo Text" value={nav.logo ?? 'AMER.'} onChange={(v) => updateEn((d) => { if (!d.nav) d.nav = {}; d.nav.logo = v })} />
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Animations & Preview">
                <div className="p-6 rounded-2xl glass-card flex flex-col items-center justify-center gap-3 border border-[--glass-border] bg-gradient-to-br from-black/60 to-black/20 shadow-inner">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[--foreground-secondary]">Live Preview</span>
                  <div className="py-4 px-8 rounded-xl bg-[#05060f] border border-white/10 flex items-center justify-center min-w-[220px] min-h-[80px] shadow-2xl">
                    {(logoSettings.logoType ?? (logoSettings.logoImage ? 'image' : 'text')) === 'image' && logoSettings.logoImage ? (
                      <img src={logoSettings.logoImage} alt="Logo" className={`h-12 w-auto max-h-14 object-contain inline-block ${getPreviewAnimClass()}`} style={getPreviewStyle()} />
                    ) : (
                      <span className={`text-3xl font-black tracking-tight inline-block ${getPreviewAnimClass()}`} style={getPreviewStyle()}>
                        {nav.logo || 'AMER.'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[--foreground-secondary]">Logo Animation Effect</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'gradient-flow', label: 'Flow' }, { id: 'glow-pulse', label: 'Pulse' }, { id: 'shimmer', label: 'Shimmer' },
                      { id: 'bounce', label: 'Bounce' }, { id: 'neon-flicker', label: 'Neon' }, { id: 'none', label: 'None' },
                    ].map((anim) => (
                      <button
                        key={anim.id} type="button" onClick={() => updateLogoSetting('animation', anim.id)}
                        className={`px-3 py-2 rounded-xl text-[11px] font-bold text-center transition-all border ${
                          (logoSettings.animation ?? 'gradient-flow') === anim.id ? 'bg-[--primary-accent]/10 text-[--primary-accent] border-[--primary-accent]' : 'bg-[--glass-bg] text-[--foreground-secondary] border-[--glass-border] hover:border-[--foreground-secondary]'
                        }`}
                      >
                        {anim.label}
                      </button>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="flex flex-col gap-6">
              <SectionCard title="Brand Colors">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-[--foreground-secondary]">Color Mode</label>
                    <div className="flex items-center gap-2">
                      {[ { id: 'gradient', label: 'Gradient Colors' }, { id: 'solid', label: 'Solid Color' } ].map((mode) => (
                        <button
                          key={mode.id} type="button" onClick={() => updateLogoSetting('colorType', mode.id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex-1"
                          style={{
                            background: (logoSettings.colorType ?? 'gradient') === mode.id ? 'color-mix(in srgb, var(--primary-accent) 15%, transparent)' : 'var(--glass-bg)',
                            color: (logoSettings.colorType ?? 'gradient') === mode.id ? 'var(--primary-accent)' : 'var(--foreground-secondary)',
                            border: `1px solid ${(logoSettings.colorType ?? 'gradient') === mode.id ? 'var(--primary-accent)' : 'var(--glass-border)'}`
                          }}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(logoSettings.colorType ?? 'gradient') === 'gradient' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wide text-[--foreground-secondary]">Start Color</label>
                        <div className="flex items-center gap-2 p-2 rounded-xl glass-card border border-[--glass-border] bg-black/20">
                          <input type="color" value={logoSettings.gradientStart ?? '#7c5cfc'} onChange={(e) => updateLogoSetting('gradientStart', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
                          <input type="text" value={logoSettings.gradientStart ?? '#7c5cfc'} onChange={(e) => updateLogoSetting('gradientStart', e.target.value)} className="w-full text-xs font-mono bg-transparent outline-none uppercase font-bold" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wide text-[--foreground-secondary]">End Color</label>
                        <div className="flex items-center gap-2 p-2 rounded-xl glass-card border border-[--glass-border] bg-black/20">
                          <input type="color" value={logoSettings.gradientEnd ?? '#22d3ee'} onChange={(e) => updateLogoSetting('gradientEnd', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
                          <input type="text" value={logoSettings.gradientEnd ?? '#22d3ee'} onChange={(e) => updateLogoSetting('gradientEnd', e.target.value)} className="w-full text-xs font-mono bg-transparent outline-none uppercase font-bold" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-[--foreground-secondary]">Solid Color</label>
                      <div className="flex items-center gap-2 p-2 rounded-xl glass-card border border-[--glass-border] bg-black/20">
                        <input type="color" value={logoSettings.solidColor ?? '#7c5cfc'} onChange={(e) => updateLogoSetting('solidColor', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
                        <input type="text" value={logoSettings.solidColor ?? '#7c5cfc'} onChange={(e) => updateLogoSetting('solidColor', e.target.value)} className="w-full text-xs font-mono bg-transparent outline-none uppercase font-bold" />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-2 border-t border-[--glass-border]">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-[--foreground-secondary]">Glow & Accent Color</label>
                    <div className="flex items-center gap-2 p-2 rounded-xl glass-card border border-[--glass-border] bg-black/20">
                      <input type="color" value={logoSettings.glowColor ?? '#7c5cfc'} onChange={(e) => updateLogoSetting('glowColor', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
                      <input type="text" value={logoSettings.glowColor ?? '#7c5cfc'} onChange={(e) => updateLogoSetting('glowColor', e.target.value)} className="w-full text-xs font-mono bg-transparent outline-none uppercase font-bold" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-[--glass-border]">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-[--foreground-secondary]">Preset Palettes</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Violet Cyan', start: '#7c5cfc', end: '#22d3ee', glow: '#7c5cfc' },
                        { name: 'Emerald Neon', start: '#10b981', end: '#06b6d4', glow: '#10b981' },
                        { name: 'Sunset Pink', start: '#ec4899', end: '#f59e0b', glow: '#ec4899' },
                        { name: 'Cyber Neon', start: '#00f3ff', end: '#ff007f', glow: '#00f3ff' },
                        { name: 'Ruby Gold', start: '#ef4444', end: '#eab308', glow: '#ef4444' },
                      ].map((preset) => (
                        <button
                          key={preset.name} type="button" onClick={() => applyPalette(preset.start, preset.end, preset.glow)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold glass-card border border-[--glass-border] hover:border-[--primary-accent] transition-all bg-black/20"
                        >
                          <span className="w-3 h-3 rounded-full shadow-inner" style={{ background: `linear-gradient(135deg, ${preset.start}, ${preset.end})` }} />
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {/* SEO TAB */}
        {siteTab === 'seo' && (
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <SectionCard title="Browser & Meta Information">
              <Field label="Browser Tab Title" value={meta.title ?? ''} onChange={(v) => updateEn((d) => { if (!d.meta) d.meta = {}; d.meta.title = v })} />
              <Field label="Meta Description" value={meta.description ?? ''} multiline onChange={(v) => updateEn((d) => { if (!d.meta) d.meta = {}; d.meta.description = v })} />
            </SectionCard>
            
            <SectionCard title="Site Favicon">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 p-4 rounded-xl glass-card border border-[--glass-border] bg-black/20">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 border-[--glass-border] flex items-center justify-center p-1 bg-[#05060f] shadow-lg">
                    {meta.favicon ? (
                      <img src={meta.favicon} alt="Favicon" className="w-full h-full object-contain" />
                    ) : (
                      <Globe size={24} style={{ color: 'var(--primary-accent)' }} />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer gradient-bg text-white hover:opacity-90 transition-opacity w-fit">
                      {uploadingFav ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {uploadingFav ? 'Uploading…' : 'Upload Favicon Image'}
                      <input type="file" accept="image/*" className="hidden" disabled={uploadingFav} onChange={async (e) => {
                        const file = e.target.files?.[0]; if (!file) return; setUploadingFav(true); const formData = new FormData(); formData.append('file', file)
                        try { const res = await fetch('/api/admin-image-upload', { method: 'POST', body: formData }); const data = await res.json(); if (data.ok && data.url) { updateEn((d) => { if (!d.meta) d.meta = {}; d.meta.favicon = data.url }) } } catch (err) { console.error(err) } finally { setUploadingFav(false) }
                      }} />
                    </label>
                  </div>
                </div>
                
                <Field label="Or Provide Favicon URL directly" value={meta.favicon ?? ''} mono onChange={(v) => updateEn((d) => { if (!d.meta) d.meta = {}; d.meta.favicon = v })} />
              </div>
            </SectionCard>
          </div>
        )}

        {/* FOOTER TAB */}
        {siteTab === 'footer' && (
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <SectionCard title="Footer Customization">
              <Field label="Copyright Text" value={footer.copyright ?? ''} onChange={(v) => updateEn((d) => { if (!d.footer) d.footer = {}; d.footer.copyright = v })} />
              <Field label="Back To Top Button Text" value={footer.back_to_top ?? ''} onChange={(v) => updateEn((d) => { if (!d.footer) d.footer = {}; d.footer.back_to_top = v })} />
              <Field label="Footer Tagline (Optional)" value={footer.tagline ?? ''} onChange={(v) => updateEn((d) => { if (!d.footer) d.footer = {}; d.footer.tagline = v })} />
            </SectionCard>
          </div>
        )}

        {/* OTHER TAB */}
        {siteTab === 'other' && (
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-6">
              <SectionCard title="Global Contact Email">
                <Field label="Primary Email Address" value={social.email ?? 'admin@portfolio'} mono onChange={(v) => updateBoth((d) => { if (!d.social) d.social = { links: [] }; d.social.email = v })} />
              </SectionCard>

              <SectionCard title="Availability Badge">
                <div className="flex items-center justify-between py-2 border-b border-[--glass-border] mb-4">
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Show Availability Badge</p>
                    <p className="text-[11px] text-[--foreground-secondary] mt-0.5">Displays a green pulsing status badge on the site.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={social.available_badge ?? true} onChange={(e) => updateBoth((d) => { if (!d.social) d.social = { links: [] }; d.social.available_badge = e.target.checked })} />
                    <div className="w-11 h-6 rounded-full peer peer-checked:bg-[--primary-accent] bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </label>
                </div>
                {(social.available_badge ?? true) && (
                  <Field label="Badge Text" value={social.availability_text ?? 'Available for work'} onChange={(v) => updateBoth((d) => { if (!d.social) d.social = { links: [] }; d.social.availability_text = v })} />
                )}
              </SectionCard>
            </div>

            <SectionCard title="Quick Links">
              <div className="flex flex-col gap-3">
                {[
                  { label: 'View Portfolio', href: '/',         icon: <Globe size={14} /> },
                  { label: 'View CV page',   href: '/cv',       icon: <FileText size={14} /> },
                  { label: 'All Projects',   href: '/projects', icon: <Tv2 size={14} /> },
                ].map((item) => (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="glass-card rounded-xl px-5 py-3.5 flex items-center justify-between border border-[--glass-border] hover:border-[--primary-accent] transition-all bg-black/20 group">
                    <div className="flex items-center gap-3">
                      <span className="p-1.5 rounded-lg bg-[--primary-accent]/10 text-[--primary-accent] group-hover:bg-[--primary-accent] group-hover:text-white transition-colors">{item.icon}</span>
                      <span className="text-sm font-bold text-[--foreground]">{item.label}</span>
                    </div>
                    <ExternalLink size={14} className="text-[--foreground-secondary] group-hover:text-[--primary-accent] transition-colors" />
                  </a>
                ))}
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Account & Security Panel ───────────────────────────────────────────────────
function AccountSection({ email, userId, onSecurityUpdate }: { email: string, userId: string, onSecurityUpdate?: () => void }) {
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false)
  const [emailForm, setEmailForm] = useState(email)
  const [mfaSystemMessage, setMfaSystemMessage] = useState('')
  const [showConfirmDisableMfa, setShowConfirmDisableMfa] = useState(false)

  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [mfaLoading, setMfaLoading] = useState(true)
  const [showMfaSetup, setShowMfaSetup] = useState(false)
  const [mfaFactorId, setMfaFactorId] = useState('')
  const [qrCodeData, setQrCodeData] = useState('')
  const [secretStr, setSecretStr] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyingMfa, setVerifyingMfa] = useState(false)
  const [mfaError, setMfaError] = useState('')
  const isEnrollingRef = useRef(false)
  
  const [emailAuthEnabled, setEmailAuthEnabled] = useState(false)

  useEffect(() => {
    setEmailForm(email)
    async function loadSecuritySettings() {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      
      // Load MFA
      const { data: mfaData } = await supabase.auth.mfa.listFactors()
      if (mfaData && mfaData.totp.length > 0) {
        setMfaEnabled(true)
      } else {
        setMfaEnabled(false)
      }
      
      // Load Email Auth pref
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user?.user_metadata?.email_login_enabled === true) {
        setEmailAuthEnabled(true)
      } else {
        setEmailAuthEnabled(false)
      }
      
      setMfaLoading(false)
    }
    loadSecuritySettings()
  }, [email])

  async function toggleEmailAuth(enabled: boolean) {
    const { createClient } = await import('@/utils/supabase/client')
    const supabase = createClient()
    setEmailAuthEnabled(enabled)
    await supabase.auth.updateUser({
      data: { email_login_enabled: enabled }
    })
    if (onSecurityUpdate) onSecurityUpdate()
  }

  async function startMfaSetup() {
    if (isEnrollingRef.current) return
    isEnrollingRef.current = true
    setMfaLoading(true)
    const { createClient } = await import('@/utils/supabase/client')
    const supabase = createClient()
    
    try {
      // Clear any dangling factors that cause the "already exists" error
      // This ensures we always start fresh when the user clicks 'Set up'
      const { data: existingFactors } = await supabase.auth.mfa.listFactors()
      if (existingFactors && existingFactors.totp) {
        for (const factor of existingFactors.totp) {
          await supabase.auth.mfa.unenroll({ factorId: factor.id })
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (error) { setMfaSystemMessage(error.message); setMfaLoading(false); isEnrollingRef.current = false; return }
      setMfaFactorId(data.id)
      setQrCodeData(data.totp.qr_code)
      setSecretStr(data.totp.secret)
      setShowMfaSetup(true)
      setMfaLoading(false)
    } finally {
      isEnrollingRef.current = false
    }
  }

  async function completeMfaSetup() {
    if (verifyCode.length < 6) { setMfaError('Code must be 6 digits'); return }
    setVerifyingMfa(true)
    setMfaError('')
    const { createClient } = await import('@/utils/supabase/client')
    const supabase = createClient()
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId })
    if (challengeError) { setMfaError(challengeError.message); setVerifyingMfa(false); return }
    
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challengeData.id, code: verifyCode })
    if (verifyError) { setMfaError(verifyError.message); setVerifyingMfa(false); return }
    
    setMfaEnabled(true)
    setShowMfaSetup(false)
    setVerifyingMfa(false)
    setVerifyCode('')
    if (onSecurityUpdate) onSecurityUpdate()
  }

  async function executeDisableMfa() {
    setMfaLoading(true)
    setShowConfirmDisableMfa(false)
    const { createClient } = await import('@/utils/supabase/client')
    const supabase = createClient()
    const { data } = await supabase.auth.mfa.listFactors()
    if (data && data.totp.length > 0) {
      for (const factor of data.totp) { await supabase.auth.mfa.unenroll({ factorId: factor.id }) }
    }
    setMfaEnabled(false)
    setMfaLoading(false)
    if (onSecurityUpdate) onSecurityUpdate()
  }

  async function triggerDisableMfa() {
    setShowConfirmDisableMfa(true)
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2 px-2">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Account & Security</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--foreground-secondary)' }}>
            Manage your credentials and set up two-factor authentication (2FA).
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 w-full items-start">
        {/* Left Column: Account Details & Password */}
        <div className="flex flex-col gap-6 w-full">
          <SectionCard title="Account Profile">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[--primary-accent] to-[#22d3ee] p-[2px] shrink-0">
                <div className="w-full h-full rounded-full bg-[#05060f] flex items-center justify-center">
                  <User size={20} style={{ color: 'var(--foreground)' }} />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Administrator</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <p className="text-[11px]" style={{ color: 'var(--foreground-secondary)' }}>Online & Active</p>
                </div>
              </div>
            </div>
            
            <Field label="Email Address" value={emailForm} onChange={(v) => setEmailForm(v)} type="email" />
            <div className="flex items-center gap-2 pt-2">
              <button className="px-4 py-2 rounded-xl text-xs font-semibold glass-card border border-[--glass-border] hover:border-[--primary-accent] transition-all" style={{ color: 'var(--foreground)' }}>
                Update Email
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Admin Security">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Password</p>
                <p className="text-[11px] text-[--foreground-secondary] mt-0.5 mb-3">Update your password regularly to keep your account secure.</p>
              </div>
              <button
                onClick={() => setShowPasswordChangeModal(true)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white gradient-bg hover:opacity-90 transition-all shadow-lg"
              >
                <KeyRound size={16} />
                Change Password
              </button>
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Two-Factor Authentication */}
        <div className="flex flex-col gap-6 w-full">
          <SectionCard title="Two-Factor Authentication (2FA)">
            <div className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${mfaEnabled ? 'bg-green-500/10 border-green-500/20' : 'glass-card border-[--glass-border]'}`}>
              {mfaLoading ? (
                <Loader2 size={20} className="animate-spin text-[--foreground-secondary]" />
              ) : mfaEnabled ? (
                <ShieldCheck size={20} className="text-green-500 mt-0.5" />
              ) : (
                <ShieldAlert size={20} className="text-amber-500 mt-0.5" />
              )}
              
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                  {mfaLoading ? 'Checking status...' : mfaEnabled ? '2FA is Active' : '2FA is Disabled'}
                </p>
                <p className="text-[11.5px] mt-1.5 leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
                  {mfaEnabled 
                    ? 'Your account is protected with an extra layer of security. You will be asked for a verification code when signing in.' 
                    : 'Add an extra layer of security to your account. We recommend enabling 2FA to prevent unauthorized access.'}
                </p>
              </div>
            </div>

            {!mfaLoading && !mfaEnabled && !showMfaSetup && (
              <button 
                onClick={startMfaSetup}
                className="mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-white gradient-bg hover:opacity-90 transition-opacity"
              >
                <Smartphone size={14} />
                Set up Authenticator App
              </button>
            )}

            {!mfaLoading && mfaEnabled && (
              <button 
                onClick={triggerDisableMfa}
                className="mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-opacity hover:bg-red-500/20 hover:text-red-400 border border-red-500/20 text-red-500 bg-red-500/10"
              >
                Disable 2FA
              </button>
            )}

            {/* MFA Setup Flow */}
            <AnimatePresence>
              {showMfaSetup && !mfaEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 flex flex-col gap-5 overflow-hidden"
                >
                  <div className="h-px w-full bg-[--glass-border]" />
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[--primary-accent] text-white flex items-center justify-center text-[11px] font-bold shrink-0">1</div>
                      <div>
                        <p className="text-xs font-bold text-[--foreground]">Scan this QR code</p>
                        <p className="text-[11px] text-[--foreground-secondary] mt-0.5">Use Google Authenticator, Authy, or 1Password.</p>
                      </div>
                    </div>
                    
                    <div className="ml-9 p-3 bg-white rounded-2xl w-fit shadow-xl">
                      {qrCodeData ? (
                        <img src={qrCodeData} alt="TOTP QR Code" className="w-32 h-32" />
                      ) : (
                        <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg">
                          <Loader2 size={24} className="animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[--primary-accent] text-white flex items-center justify-center text-[11px] font-bold shrink-0">2</div>
                      <div>
                        <p className="text-xs font-bold text-[--foreground]">Or enter secret manually</p>
                        <p className="text-[11px] text-[--foreground-secondary] mt-0.5">If you cannot scan the QR code.</p>
                      </div>
                    </div>
                    <div className="ml-9 flex items-center gap-2">
                      <code className="text-xs font-mono bg-black/40 px-3 py-2.5 rounded-xl border border-[--glass-border] flex-1 text-center tracking-widest text-[--primary-accent]">
                        {secretStr || 'LOADING...'}
                      </code>
                      <button 
                        onClick={() => navigator.clipboard.writeText(secretStr)}
                        className="p-2.5 rounded-xl glass-card border border-[--glass-border] hover:border-[--primary-accent] hover:text-[--primary-accent] transition-all text-[--foreground-secondary]"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[--primary-accent] text-white flex items-center justify-center text-[11px] font-bold shrink-0">3</div>
                      <div>
                        <p className="text-xs font-bold text-[--foreground]">Verify the code</p>
                        <p className="text-[11px] text-[--foreground-secondary] mt-0.5">Enter the 6-digit code from your app.</p>
                      </div>
                    </div>
                    <div className="ml-9 flex items-center gap-2">
                      <input 
                        type="text" 
                        maxLength={6}
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000 000"
                        className="w-32 text-center tracking-[0.2em] font-mono font-bold text-sm bg-[--glass-bg] border border-[--glass-border] rounded-xl px-4 py-2.5 outline-none focus:border-[--primary-accent] text-[--foreground]"
                      />
                      <button 
                        onClick={completeMfaSetup}
                        disabled={verifyingMfa || verifyCode.length < 6}
                        className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white gradient-bg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                      >
                        {verifyingMfa ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} 
                        Verify
                      </button>
                    </div>
                    {mfaError && (
                      <p className="ml-9 text-xs text-red-400 mt-1">{mfaError}</p>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setShowMfaSetup(false)}
                    className="mt-1 text-[11px] text-[--foreground-secondary] hover:text-[--foreground] transition-colors text-center w-full py-2"
                  >
                    Cancel Setup
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>

          <SectionCard title="Email Verification (Login with Code)">
            <div className="flex items-center justify-between py-2 mb-2">
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Email Verification</p>
                <p className="text-[11px] text-[--foreground-secondary] mt-0.5 max-w-[280px]">Require a one-time code sent to your email to verify your identity upon login.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={emailAuthEnabled} 
                  onChange={(e) => toggleEmailAuth(e.target.checked)} 
                />
                <div className="w-11 h-6 rounded-full peer peer-checked:bg-[--primary-accent] bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>
            
            <div className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${emailAuthEnabled ? 'bg-blue-500/10 border-blue-500/20' : 'glass-card border-[--glass-border]'}`}>
              {emailAuthEnabled ? <Mail size={20} className="text-blue-500 mt-0.5" /> : <ShieldAlert size={20} className="text-amber-500 mt-0.5" />}
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                  {emailAuthEnabled ? 'Email Authentication Active' : 'Email Authentication Disabled'}
                </p>
                <p className="text-[11.5px] mt-1.5 leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
                  {emailAuthEnabled 
                    ? 'When you log in, you will also be able to receive a secure code via email to access the admin panel.' 
                    : 'We strongly recommend keeping Email Authentication enabled if you do not use an Authenticator app.'}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <AnimatePresence>
        {mfaSystemMessage && (
          <SystemMessageModal message={mfaSystemMessage} onClose={() => setMfaSystemMessage('')} />
        )}
        {showConfirmDisableMfa && (
          <ConfirmDisableMfaModal 
            onConfirm={executeDisableMfa} 
            onCancel={() => setShowConfirmDisableMfa(false)} 
            loading={mfaLoading}
          />
        )}
        {showPasswordChangeModal && (
          <PasswordChangeModal 
            email={email} 
            mfaEnabled={mfaEnabled} 
            onClose={() => setShowPasswordChangeModal(false)} 
            onSuccess={(msg) => { setShowPasswordChangeModal(false); setMfaSystemMessage(msg) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function SystemMessageModal({ message, onClose }: { message: string, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm glass-card border border-[--glass-border] rounded-2xl p-6 shadow-2xl flex flex-col"
      >
        <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 shrink-0">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Notice</h3>
        <p className="text-sm text-[--foreground-secondary] leading-relaxed mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-white glass-card border border-[--glass-border] hover:border-[--foreground-secondary] transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function ConfirmDisableMfaModal({ onConfirm, onCancel, loading }: { onConfirm: () => void, onCancel: () => void, loading?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm glass-card border border-[--glass-border] rounded-2xl p-6 shadow-2xl flex flex-col"
      >
        <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-4 shrink-0">
          <ShieldAlert size={24} />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Disable 2FA?</h3>
        <p className="text-sm text-[--foreground-secondary] leading-relaxed mb-6">
          Are you sure you want to disable Two-Factor Authentication? This will significantly reduce the security of your account and remove all enrolled devices.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={loading} className="px-5 py-2.5 rounded-full text-xs font-bold text-white glass-card border border-[--glass-border] hover:border-[--foreground-secondary] transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Yes, Disable
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function PasswordChangeModal({ email, mfaEnabled, onClose, onSuccess }: { email: string, mfaEnabled: boolean, onClose: () => void, onSuccess: (m: string) => void }) {
  const [step, setStep] = useState<'current' | 'mfa' | 'new'>('current')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  const [currentPw, setCurrentPw] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [mfaFactorId, setMfaFactorId] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()"
    let pwd = ""
    for (let i = 0; i < 16; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    setNewPw(pwd)
    setConfirmPw(pwd)
    setShowNew(true)
    setShowConfirm(true)
    navigator.clipboard.writeText(pwd).catch(() => {})
  }

  const getStrength = (pw: string) => {
    if (!pw) return { label: '', color: 'transparent', width: '0%' }
    if (pw.length < 6) return { label: 'Weak', color: '#ef4444', width: '33%' }
    const hasNum = /\d/.test(pw)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pw)
    const hasUpper = /[A-Z]/.test(pw)
    if (pw.length >= 8 && hasNum && hasSpecial && hasUpper) return { label: 'Strong', color: '#22c55e', width: '100%' }
    if (pw.length >= 6 && (hasNum || hasSpecial || hasUpper)) return { label: 'Fair', color: '#eab308', width: '66%' }
    return { label: 'Weak', color: '#ef4444', width: '33%' }
  }
  const strength = getStrength(newPw)

  async function handleVerifyCurrent() {
    if (!currentPw) return setErrorMsg('Enter your current password')
    setLoading(true)
    setErrorMsg('')
    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPw })
      if (signInError) throw new Error('Current password is incorrect')
      
      if (mfaEnabled) {
        const { data: mfaData } = await supabase.auth.mfa.listFactors()
        if (mfaData && mfaData.totp.length > 0) {
          setMfaFactorId(mfaData.totp[0].id)
          setStep('mfa')
        } else {
          setStep('new')
        }
      } else {
        setStep('new')
      }
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleVerifyMfa() {
    if (verifyCode.length < 6) return setErrorMsg('Code must be 6 digits')
    setLoading(true)
    setErrorMsg('')
    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId })
      if (challengeError) throw new Error(challengeError.message)
      const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challengeData.id, code: verifyCode })
      if (verifyError) throw new Error(verifyError.message)
      setStep('new')
    } catch(err: any) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleSaveNew() {
    if (newPw.length < 6) return setErrorMsg('Password must be at least 6 characters')
    if (newPw !== confirmPw) return setErrorMsg('Passwords do not match')
    setLoading(true)
    setErrorMsg('')
    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password: newPw })
      if (updateError) throw new Error(updateError.message)
      onSuccess('Your password has been successfully updated!')
    } catch(err: any) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md glass-card rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-[--glass-border]"
      >
        <div className="px-6 py-5 border-b border-[--glass-border] flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <KeyRound size={18} className="text-[--primary-accent]" />
            Change Password
          </h3>
          <button onClick={onClose} className="text-[11px] font-bold text-[--foreground-secondary] hover:text-white transition-colors">
            Cancel
          </button>
        </div>
        
        <div className="p-6">
          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500 text-xs font-bold">
              <AlertCircle size={14} className="shrink-0" />
              {errorMsg}
            </div>
          )}

          {step === 'current' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
              <p className="text-sm text-[--foreground-secondary]">First, enter your current password to verify it's you.</p>
              <Field 
                label="Current Password" 
                type="password"
                value={currentPw} 
                onChange={setCurrentPw} 
                onKeyDown={e => e.key === 'Enter' && handleVerifyCurrent()}
              />
              <button onClick={handleVerifyCurrent} disabled={loading || !currentPw} className="w-full mt-2 py-3 rounded-full text-xs font-bold text-white gradient-bg flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 size={14} className="animate-spin" /> : 'Continue'}
              </button>
            </motion.div>
          )}

          {step === 'mfa' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
              <p className="text-sm text-[--foreground-secondary]">Enter the 6-digit code from your Authenticator app.</p>
              <Field 
                label="Authenticator Code"
                mono
                value={verifyCode}
                onChange={v => setVerifyCode(v.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && handleVerifyMfa()}
              />
              <button onClick={handleVerifyMfa} disabled={loading || verifyCode.length < 6} className="w-full mt-2 py-3 rounded-full text-xs font-bold text-white gradient-bg flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 size={14} className="animate-spin" /> : 'Verify Code'}
              </button>
            </motion.div>
          )}

          {step === 'new' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[--foreground-secondary]">Create your new password.</p>
                <button onClick={generatePassword} type="button" className="text-[11px] font-bold text-[--primary-accent] hover:bg-[--primary-accent] hover:text-white flex items-center gap-1.5 bg-[--primary-accent]/10 px-2.5 py-1.5 rounded-lg transition-colors">
                  <RefreshCw size={10} /> Generate & Copy
                </button>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <Field 
                    label="New Password" 
                    type="password"
                    value={newPw} 
                    onChange={setNewPw} 
                  />
                  {newPw && (
                    <div className="w-full mt-1.5 bg-[--glass-bg] rounded-full overflow-hidden flex h-1.5 border border-[--glass-border]">
                      <motion.div initial={{ width: 0 }} animate={{ width: strength.width, backgroundColor: strength.color }} className="h-full transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                    </div>
                  )}
                </div>

                <Field 
                  label="Confirm New Password" 
                  type="password"
                  value={confirmPw} 
                  onChange={setConfirmPw} 
                  onKeyDown={e => e.key === 'Enter' && handleSaveNew()}
                />
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button onClick={onClose} disabled={loading} className="w-1/3 py-3 rounded-full text-xs font-bold text-[--foreground] glass-card border border-[--glass-border] hover:border-[--foreground-secondary] transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleSaveNew} disabled={loading || !newPw || !confirmPw} className="flex-1 py-3 rounded-full text-xs font-bold text-white gradient-bg flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : 'Save New Password'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
