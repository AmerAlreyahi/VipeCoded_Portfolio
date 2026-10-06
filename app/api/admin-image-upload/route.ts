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

    if (!file) {
      return NextResponse.json({ error: 'Missing image file' }, { status: 400 })
    }

    const allowedTypes: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'image/avif': '.avif',
      'image/x-icon': '.ico',
      'image/vnd.microsoft.icon': '.ico',
    }
    if (!allowedTypes[file.type]) {
      return NextResponse.json({ error: 'Only PNG, JPG, WebP, GIF, AVIF or ICO images are accepted' }, { status: 400 })
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image file too large (max 15 MB)' }, { status: 400 })
    }

    const ext = allowedTypes[file.type]
    const safeBaseName = path.basename(file.name, path.extname(file.name)).replace(/[^a-zA-Z0-9_-]/g, '_') || 'image'
    const filename = `${safeBaseName}_${Date.now()}${ext}`

    const supabase = await createClient()

    const bytes = await file.arrayBuffer()
    const { data, error } = await supabase.storage
      .from('portfolio')
      .upload(`uploads/${filename}`, bytes, {
        contentType: file.type,
        upsert: true,
      })

    if (error) {
      console.error('[admin-image-upload] Supabase Storage upload error:', error)
      return NextResponse.json(
        { error: `Supabase Storage upload failed: ${error.message}` },
        { status: 400 }
      )
    }

    if (data) {
      const { data: publicUrlData } = supabase.storage
        .from('portfolio')
        .getPublicUrl(`uploads/${filename}`)

      if (publicUrlData?.publicUrl) {
        return NextResponse.json({ ok: true, url: publicUrlData.publicUrl })
      }
    }

    return NextResponse.json(
      { error: 'Failed to retrieve public URL from Supabase Storage' },
      { status: 500 }
    )
  } catch (err) {
    console.error('[admin-image-upload] fatal error:', err)
    return NextResponse.json(
      { error: 'Image upload failed' },
      { status: 500 }
    )
  }
}
