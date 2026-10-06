'use client'

import { motion } from 'framer-motion'
import { ChevronUp } from 'lucide-react'
import { useContent } from '@/hooks/useContent'
import { useLanguage } from '@/context/LanguageContext'

export default function Footer() {
  const content = useContent()
  const { isRTL } = useLanguage()
  const footer = content?.footer || {}

  const copyrightText = footer.copyright || (isRTL ? '© 2026 اسمك. جميع الحقوق محفوظة.' : '© 2026 Your Name. All rights reserved.')
  const backToTopText = footer.back_to_top || (isRTL ? 'الرجوع للأعلى' : 'Back to top')

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer
      className="border-t py-8 px-4 sm:px-6"
      style={{
        borderColor: 'var(--border)',
        fontFamily: isRTL ? 'var(--font-arabic)' : 'inherit',
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-center sm:text-start">
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {copyrightText}
          </p>
          {footer.tagline && (
            <p className="text-xs" style={{ color: 'var(--foreground-secondary)', opacity: 0.8 }}>
              {footer.tagline}
            </p>
          )}
        </div>

        <motion.button
          onClick={scrollToTop}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-[--primary-accent]"
          style={{ color: 'var(--foreground-secondary)' }}
          aria-label={backToTopText}
        >
          {backToTopText}
          <span
            className="w-7 h-7 rounded-full border flex items-center justify-center"
            style={{ borderColor: 'var(--border)' }}
          >
            <ChevronUp size={14} />
          </span>
        </motion.button>
      </div>
    </footer>
  )
}
