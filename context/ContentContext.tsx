'use client'

import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import type { ContentJSON } from '@/lib/getContentFromSupabase'
import { useLanguage } from '@/context/LanguageContext'

// We need a context to hold the content
export const ContentContext = createContext<ContentJSON | null>(null)

export function ContentProvider({ children, initialData }: { children: ReactNode, initialData: ContentJSON }) {
  const { lang } = useLanguage()

  useEffect(() => {
    if (initialData?.[lang]?.meta?.title) {
      document.title = initialData[lang].meta.title
    }
  }, [lang, initialData])

  return (
    <ContentContext.Provider value={initialData}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContentContext() {
  const context = useContext(ContentContext)
  if (!context) {
    throw new Error('useContentContext must be used within a ContentProvider')
  }
  return context
}

