import { NextResponse } from 'next/server'
import { getContentFromSupabase } from '@/lib/getContentFromSupabase'

export interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  stargazers_count: number
  language: string | null
  topics: string[]
  isPlaceholder?: boolean
}

export async function GET() {
  const content = await getContentFromSupabase()
  const username = content?.en?.github?.username || process.env.GITHUB_USERNAME
  
  if (!username || username.trim() === '') {
    return NextResponse.json([], { status: 200 })
  }

  try {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'portfolio-app',
    }
    // Note: If you have a token in env it can still be used for higher rate limits
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
    }

    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=30`,
      { headers, next: { revalidate: 3600 } }
    )

    if (!res.ok) return NextResponse.json([], { status: 200 })

    const all = await res.json()

    const filtered = (all as Array<{
      id: number; name: string; description: string | null;
      html_url: string; homepage: string | null;
      stargazers_count: number; language: string | null;
      topics: string[]; fork: boolean; private: boolean;
    }>)
      .filter((r) => !r.fork && !r.private)
      .filter((r) => r.topics?.includes('portfolio') || r.stargazers_count > 0)
      .slice(0, 9)
      .map(({ id, name, description, html_url, homepage, stargazers_count, language, topics }) => ({
        id, name, description, html_url, homepage: homepage || null,
        stargazers_count, language, topics,
        isPlaceholder: false,
      } as GitHubRepo))

    return NextResponse.json(filtered)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
