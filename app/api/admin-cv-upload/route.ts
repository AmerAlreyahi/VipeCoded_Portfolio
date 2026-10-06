import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(req: Request) {
  try {
    const accessError = await requireAdmin()
    if (accessError) return accessError

    const formData = await req.formData()
    const file = formData.get('file')
    const locale = formData.get('locale')

    if (!(file instanceof File) || typeof locale !== 'string' || !['en', 'ar'].includes(locale)) {
      return NextResponse.json({ error: 'Missing file or invalid locale' }, { status: 400 })
    }

    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 })
    }

    if (file.size === 0 || file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be between 1 byte and 10 MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const signature = new TextDecoder().decode(bytes.slice(0, 5))
    if (signature !== '%PDF-') {
      return NextResponse.json({ error: 'The uploaded file is not a valid PDF' }, { status: 400 })
    }

    const filename = locale === 'ar' ? 'resume-ar.pdf' : 'resume-en.pdf'

    // Uses the signed-in admin's session, so Storage RLS (portfolio_admins) decides access.
    const supabase = await createClient()

    const { data, error } = await supabase.storage
      .from('portfolio')
      .upload(`cv/${filename}`, bytes, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (error) {
      console.error('[admin-cv-upload] Supabase Storage upload error:', error)
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
        return NextResponse.json({ ok: true, path: publicUrlData.publicUrl })
      }
    }

    return NextResponse.json(
      { error: 'Failed to retrieve public URL from Supabase Storage' },
      { status: 500 }
    )
  } catch (err) {
    console.error('[admin-cv-upload]', err)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
