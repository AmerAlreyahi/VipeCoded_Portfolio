import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { isAdminEmail } from '@/lib/admin-allowlist'

export async function requireAdmin() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.json({ error: 'Supabase authentication is not configured.' }, { status: 503 })
  }

  if (!process.env.ADMIN_EMAILS?.trim()) {
    console.error('Admin access is disabled because ADMIN_EMAILS is not configured.')
    return NextResponse.json({ error: 'Admin access is not configured.' }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}
