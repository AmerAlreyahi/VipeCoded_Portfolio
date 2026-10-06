'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useContent } from '@/hooks/useContent'
import { useLanguage } from '@/context/LanguageContext'

export default function About() {
  const content = useContent()
  const { isRTL } = useLanguage()
  const about = content.about
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="about"
      ref={ref}
      className="py-20 px-4 sm:px-6"
      style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'inherit' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: 'var(--primary-accent)' }}
        >
          {about.section_label}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold mb-8"
          style={{ color: 'var(--foreground)' }}
        >
          {about.heading}
        </motion.h2>

        <div className={`grid md:grid-cols-2 gap-12 items-start`} style={{ overflow: 'clip' }}>
          {/* Paragraphs */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {about.paragraphs.map((para, i) => (
              <p
                key={i}
                className="text-base leading-relaxed"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                {para}
              </p>
            ))}
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            {about.stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                className="glass-card rounded-2xl p-5"
              >
                <p className="text-3xl font-bold gradient-text mb-1">{stat.value}</p>
                <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
