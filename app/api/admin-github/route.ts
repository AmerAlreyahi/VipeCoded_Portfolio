import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/lib/admin-auth'

async function getContentGitHub() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('site_settings').select('github_username').eq('lang', 'en').single()
    return { username: data?.github_username || '' }
  } catch { return {} as { username?: string } }
}

/**
 * GET  — test GitHub connection or fetch repos (for import picker)
 *        Priority: query params > env vars > DB saved credentials
 */
export async function GET(req: Request) {
  const accessError = await requireAdmin()
  if (accessError) return accessError

  const saved = await getContentGitHub()
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username') || process.env.GITHUB_USERNAME || saved.username
  const token    = searchParams.get('token')    || process.env.GITHUB_TOKEN

  if (!username) {
    return NextResponse.json({ error: 'No username provided' }, { status: 400 })
  }

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'portfolio-admin',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`, { headers })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: (err as { message?: string }).message ?? 'GitHub API error' }, { status: res.status })
    }
    const repos = await res.json() as Array<{
      id: number; name: string; description: string | null
      html_url: string; homepage: string | null
      stargazers_count: number; language: string | null
      topics: string[]; fork: boolean; private: boolean
    }>
    const public_repos = repos.filter((r) => !r.private)
    return NextResponse.json({
      ok: true,
      count: public_repos.length,
      repos: public_repos.map(({ id, name, description, html_url, homepage, stargazers_count, language, topics }) => ({
        id, name, description, html_url, homepage, stargazers_count, language, topics,
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Network error' }, { status: 500 })
  }
}
