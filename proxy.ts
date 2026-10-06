import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL?.trim()
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim()
  const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey)

  if (!hasSupabaseConfig) {
    const pathname = request.nextUrl.pathname
    const isAdminRoute = pathname.startsWith('/admin')
    const isAdminApiRoute = pathname.startsWith('/api/admin-')

    if (isAdminRoute || isAdminApiRoute) {
      return NextResponse.json(
        { error: 'Supabase authentication is not configured.' },
        { status: 503 }
      )
    }

    return NextResponse.next()
  }

  return await updateSession(request)
}

// Only the admin area needs session refresh / guarding. Running this on public pages would add a
// Supabase auth round-trip to every visit and prevent static caching.
export const config = {
  matcher: ['/admin/:path*', '/api/:path(admin-.*)'],
}
