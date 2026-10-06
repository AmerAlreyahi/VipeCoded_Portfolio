'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'

export default function NotFound() {
  const { isRTL } = useLanguage()
  
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-8xl font-bold mb-4 text-primary">404</h1>
        <h2 className="text-2xl font-medium mb-4">
          {isRTL ? 'عذراً، الصفحة غير موجودة' : 'Oops! Page Not Found'}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {isRTL 
            ? 'يبدو أن الصفحة التي تبحث عنها غير موجودة أو تم نقلها.' 
            : 'The page you are looking for does not exist or has been moved.'}
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-full font-medium transition-colors"
        >
          {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>
      </motion.div>
    </main>
  )
}
