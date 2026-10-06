'use client'

import { useLanguage } from '@/context/LanguageContext'
import { useContentContext } from '@/context/ContentContext'
import type { LangContent } from '@/lib/getContentFromSupabase'

export type ContentData = LangContent

export function useContent(): ContentData {
  const { lang } = useLanguage()
  const contentData = useContentContext()
  return contentData[lang] as ContentData
}
