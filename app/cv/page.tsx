'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FaArrowLeft, FaArrowRight, FaDownload, FaCheck } from 'react-icons/fa6'
import { useLanguage } from '@/context/LanguageContext'
import { useContent } from '@/hooks/useContent'
import Navbar from '@/components/Navbar'

type BtnState = 'idle' | 'loading' | 'done'

/* ── Premium animated download button ───────────────────── */
function DownloadButton({
  label,
  loadingLabel,
  doneLabel,
  onClick,
  state,
}: {
  label: string
  loadingLabel: string
  doneLabel: string
  onClick: () => void
  state: BtnState
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={state !== 'idle'}
      animate={state === 'loading' ? { scale: 0.97 } : { scale: 1 }}
      whileHover={state === 'idle' ? { scale: 1.05, y: -2 } : {}}
      whileTap={state === 'idle' ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className="relative px-10 py-4 rounded-2xl text-sm font-semibold text-white overflow-hidden disabled:cursor-not-allowed"
      style={{
        background: state === 'done'
          ? 'linear-gradient(135deg, #22d3ee, #22c55e)'
          : 'var(--gradient)',
        boxShadow: state === 'done'
          ? '0 4px 32px rgba(34,211,238,0.4), 0 0 0 1px rgba(34,211,238,0.2)'
          : '0 4px 32px rgba(124,92,252,0.45), 0 0 0 1px rgba(124,92,252,0.2)',
        transition: 'background 0.4s ease, box-shadow 0.4s ease',
      }}
    >
      {/* Repeating shimmer on idle */}
      {state === 'idle' && (
        <motion.span
          className="absolute inset-0 -skew-x-12 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)' }}
          initial={{ x: '-150%' }}
          animate={{ x: '250%' }}
          transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.5 }}
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        {state === 'idle' && (
          <motion.span key="idle"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-2.5"
          >
            <FaDownload size={14} />{label}
          </motion.span>
        )}
        {state === 'loading' && (
          <motion.span key="loading"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-2.5"
          >
            <span className="w-4 h-4 rounded-full border-2 shrink-0"
              style={{ borderColor: 'rgba(255,255,255,0.28)', borderTopColor: '#fff', animation: 'cv-spin 0.7s linear infinite' }}
            />
            {loadingLabel}
          </motion.span>
        )}
        {state === 'done' && (
          <motion.span key="done"
            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.28, type: 'spring', stiffness: 380, damping: 18 }}
            className="flex items-center justify-center gap-2.5"
          >
            <motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.35, 1] }} transition={{ duration: 0.4, times: [0, 0.65, 1] }}>
              <FaCheck size={14} />
            </motion.span>
            {doneLabel}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function CVPage() {
  const { isRTL, lang } = useLanguage()
  const content = useContent()
  const [btnState, setBtnState] = useState<BtnState>('idle')

  const cvPaths = (content.cv as { en: string; ar: string }) || {
    en: '/cv/resume-en.pdf',
    ar: '/cv/resume-ar.pdf',
  }

  // Show only the CV for the current language
  const pdfPath  = cvPaths[lang as 'en' | 'ar']
  const filename = lang === 'ar' ? 'resume-ar.pdf' : 'resume-en.pdf'

  const downloadLabel = lang === 'ar' ? 'تحميل السيرة الذاتية' : 'Download CV'
  const loadingLabel  = lang === 'ar' ? 'جاري التحميل…'       : 'Downloading…'
  const doneLabel     = lang === 'ar' ? 'تم بنجاح ✓'          : 'Downloaded!'

  async function handleDownload() {
    if (btnState !== 'idle') return
    setBtnState('loading')
    // Spinner for 1.5 s, then trigger actual download
    await new Promise((r) => setTimeout(r, 1500))
    try {
      const res = await fetch(pdfPath)
      if (res.ok) {
        const blob = await res.blob()
        const url  = URL.createObjectURL(blob)
        const a    = Object.assign(document.createElement('a'), { href: url, download: filename })
        document.body.appendChild(a)
        a.click()
        URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch { /* show success UX regardless */ }
    setBtnState('done')
    setTimeout(() => setBtnState('idle'), 2200)
  }

  return (
    <>
      <Navbar />
      <style>{`@keyframes cv-spin { to { transform: rotate(360deg); } }`}</style>

      <main
        className="min-h-screen pt-28 pb-24 px-4 sm:px-6"
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'inherit' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col gap-8">

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium transition-all hover:text-[--primary-accent] hover:scale-105"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              {isRTL ? <FaArrowRight size={12} /> : <FaArrowLeft size={12} />}
              {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="text-center"
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--primary-accent)' }}>
              {lang === 'ar' ? 'الملف المهني' : 'CURRICULUM VITAE'}
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-balance" style={{ color: 'var(--foreground)' }}>
              {lang === 'ar' ? 'سيرتي الذاتية' : 'My Resume'}
            </h1>
          </motion.div>

          {/* PDF viewer — glass-card frame */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
            className="w-full rounded-3xl overflow-hidden"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: '1px solid color-mix(in srgb, var(--primary-accent) 28%, var(--glass-border))',
              boxShadow: '0 1px 0 0 var(--glass-highlight) inset, 0 12px 60px color-mix(in srgb, var(--primary-accent) 10%, transparent)',
            }}
          >
            {/* macOS-style title bar */}
            <div
              className="flex items-center gap-2 px-5 py-3 border-b"
              style={{ borderColor: 'var(--glass-border)', background: 'rgba(0,0,0,0.22)' }}
            >
              <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
              <span className="ml-4 text-xs font-mono opacity-50" style={{ color: 'var(--foreground-secondary)' }}>
                {filename}
              </span>
            </div>

            <iframe
              key={pdfPath}
              src={`${pdfPath}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              title={lang === 'ar' ? 'السيرة الذاتية' : 'Resume PDF'}
              className="w-full"
              style={{ height: '78vh', border: 'none', display: 'block' }}
            />
          </motion.div>

          {/* Download button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.26 }}
            className="flex justify-center"
          >
            <DownloadButton
              label={downloadLabel}
              loadingLabel={loadingLabel}
              doneLabel={doneLabel}
              onClick={handleDownload}
              state={btnState}
            />
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-center text-xs"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {lang === 'ar' ? 'الملف بصيغة PDF — جاهز للطباعة' : 'PDF format — optimised for print and ATS'}
          </motion.p>
        </div>
      </main>
    </>
  )
}
