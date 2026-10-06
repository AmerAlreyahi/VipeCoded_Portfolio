import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** True when next/image may optimize `src` (local files and this project's Supabase Storage). */
export function canOptimizeImage(src: string) {
  if (src.startsWith('/')) return true
  try {
    return new URL(src).hostname === new URL(process.env.SUPABASE_URL ?? '').hostname
  } catch {
    return false
  }
}
