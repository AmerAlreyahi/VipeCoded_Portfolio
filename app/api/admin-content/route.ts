import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getContentFromSupabase, CONTENT_CACHE_TAG } from '@/lib/getContentFromSupabase'
import { saveContentToSupabase } from '@/lib/saveContentToSupabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const accessError = await requireAdmin()
  if (accessError) return accessError

  try {
    const data = await getContentFromSupabase(true)
    if (!data) throw new Error('No data')
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Could not read from Supabase' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const accessError = await requireAdmin()
  if (accessError) return accessError

  try {
    const updates = await req.json()

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const current = await getContentFromSupabase(true) || { en: {}, ar: {} }

    function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
      const out = { ...target }
      for (const key of Object.keys(source)) {
        if (
          source[key] !== null &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key]) &&
          typeof target[key] === 'object' &&
          !Array.isArray(target[key])
        ) {
          out[key] = deepMerge(target[key], source[key])
        } else {
          out[key] = source[key]
        }
      }
      return out
    }

    const merged = deepMerge(current, updates)
    const ok = await saveContentToSupabase(merged as any)
    if (!ok) throw new Error('Supabase save failed')

    // Make the public site pick up the change immediately.
    revalidateTag(CONTENT_CACHE_TAG, { expire: 0 })
    revalidatePath('/', 'layout')

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin-content] PATCH error:', err)
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
  }
}
