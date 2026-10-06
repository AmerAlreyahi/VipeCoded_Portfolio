'use client'

import { usePathname } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import PageTransition from '@/components/PageTransition'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={pathname}>
        {children}
      </PageTransition>
    </AnimatePresence>
  )
}
