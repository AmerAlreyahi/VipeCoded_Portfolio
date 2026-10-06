'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useContent } from '@/hooks/useContent'
import { useLanguage } from '@/context/LanguageContext'

export default function Career() {
  const content = useContent()
  const { isRTL } = useLanguage()
  const career = content.career
  if (!career) return null

  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="career"
      ref={ref}
      className="py-20 px-4 sm:px-6"
      style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'inherit' }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: 'var(--primary-accent)' }}
        >
          {career.section_label}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
          className="text-3xl sm:text-4xl font-bold mb-12 text-balance"
          style={{ color: 'var(--foreground)' }}
        >
          {career.heading}
        </motion.h2>

        <div className={`relative ${isRTL ? 'pr-8' : 'pl-8'}`}>
          {/* Vertical gradient line */}
          <div
            className={`absolute top-0 bottom-0 w-px ${isRTL ? 'right-0' : 'left-0'}`}
            style={{
              background:
                'linear-gradient(to bottom, transparent, var(--primary-accent) 15%, var(--secondary-accent) 85%, transparent)',
              opacity: 0.4,
            }}
          />

          <div className="flex flex-col gap-10">
            {career.items.map((item, i) => (
              <TimelineEntry
                key={i}
                item={item}
                index={i}
                inView={inView}
                isRTL={isRTL}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

interface CareerItem { role: string; company: string; startDate: string; endDate: string; description: string }

function TimelineEntry({
  item, index, inView, isRTL,
}: {
  item: CareerItem; index: number; inView: boolean; isRTL: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isRTL ? 16 : -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.12 + index * 0.1 }}
      className="relative"
    >
      {/* Glowing dot */}
      <div
        className={`absolute ${isRTL ? '-right-[2.15rem]' : '-left-[2.15rem]'} top-1 w-3 h-3 rounded-full`}
        style={{
          background: 'var(--gradient)',
          boxShadow: '0 0 8px var(--primary-accent), 0 0 16px var(--ring)',
          border: '2px solid var(--background)',
        }}
      />

      {/* Card */}
      <div
        className="glass-card rounded-2xl p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <h3
              className="font-bold text-base sm:text-lg"
              style={{ color: 'var(--foreground)' }}
            >
              {item.role}
            </h3>
            <p
              className="text-sm font-semibold mt-0.5"
              style={{ color: 'var(--primary-accent)' }}
            >
              {item.company}
            </p>
          </div>
          <span
            className="text-xs font-medium px-3 py-1 rounded-full shrink-0"
            style={{
              background: 'var(--muted)',
              color: 'var(--foreground-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            {item.startDate} — {item.endDate}
          </span>
        </div>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {item.description}
        </p>
      </div>
    </motion.div>
  )
}
