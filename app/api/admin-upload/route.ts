import { NextResponse } from 'next/server'
import path from 'path'
import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(req: Request) {
  const accessError = await requireAdmin()
  if (accessError) return accessError

  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const locale = form.get('locale') as string | null

    if (!file || !locale || !['en', 'ar'].includes(locale)) {
      return NextResponse.json({ error: 'Missing file or invalid locale' }, { status: 400 })
    }

    if (!file.name.endsWith('.pdf') || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 })
    }

    const filename = `resume-${locale}.pdf`

    // Uses the signed-in admin's session, so Storage RLS (portfolio_admins) decides access.
    const supabase = await createClient()

    const bytes = await file.arrayBuffer()
    const { data, error } = await supabase.storage
      .from('portfolio')
      .upload(`cv/${filename}`, bytes, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (error) {
      console.error('[admin-upload] Supabase Storage upload error:', error)
      return NextResponse.json(
        { error: `Supabase Storage upload failed: ${error.message}` },
        { status: 400 }
      )
    }

    if (data) {
      const { data: publicUrlData } = supabase.storage
        .from('portfolio')
        .getPublicUrl(`cv/${filename}`)

      if (publicUrlData?.publicUrl) {
        // Append a cache-buster query parameter to force browser to fetch the new file
        const urlWithCacheBuster = `${publicUrlData.publicUrl}?v=${Date.now()}`
        return NextResponse.json({ ok: true, path: urlWithCacheBuster })
      }
    }

    return NextResponse.json(
      { error: 'Failed to retrieve public URL from Supabase Storage' },
      { status: 500 }
    )
  } catch (err: any) {
    console.error('[admin-upload] fatal error:', err)
    return NextResponse.json(
      { error: err.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
