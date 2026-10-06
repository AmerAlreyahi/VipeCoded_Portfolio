'use client'

import { motion, type Variants, type Easing } from 'framer-motion'

const easeStandard: Easing = [0.4, 0, 0.2, 1] as unknown as Easing
const easeAccelerate: Easing = [0.4, 0, 1, 1] as unknown as Easing

const variants: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeStandard } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.3, ease: easeAccelerate } },
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}
