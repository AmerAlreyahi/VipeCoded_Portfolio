'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'

export type Lang = 'en' | 'ar'

interface LanguageContextValue {
  lang: Lang
  toggleLang: () => void
  isRTL: boolean
  switching: boolean
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  toggleLang: () => {},
  isRTL: false,
  switching: false,
})

const TRANSITION_MS = 280

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const [switching, setSwitching] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isRTL = lang === 'ar'

  const applyLang = useCallback((nextLang: Lang) => {
    const dir = nextLang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('lang', nextLang)
    document.documentElement.setAttribute('dir', dir)
    localStorage.setItem('portfolio-lang', nextLang)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('portfolio-lang') as Lang | null
    const initial = stored ?? 'en'
    setLang(initial)
    applyLang(initial)
  }, [applyLang])

  const toggleLang = useCallback(() => {
    if (switching) return // prevent rapid clicks
    setSwitching(true)

    // After fade-out completes, switch language and fade back in
    timeoutRef.current = setTimeout(() => {
      setLang((prev) => {
        const next: Lang = prev === 'en' ? 'ar' : 'en'
        applyLang(next)
        return next
      })

      // Small delay before removing switching state for fade-in
      setTimeout(() => setSwitching(false), 50)
    }, TRANSITION_MS)
  }, [applyLang, switching])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, isRTL, switching }}>
      <div
        className="lang-transition-wrapper"
        style={{
          opacity: switching ? 0 : 1,
          transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
