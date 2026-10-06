import type { Metadata, Viewport } from 'next'
import { Inter, Readex_Pro, Tajawal } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/context/LanguageContext'
import { ContentProvider } from '@/context/ContentContext'
import { getContentFromSupabase } from '@/lib/getContentFromSupabase'
import './globals.css'

// Statically rendered and refreshed in the background; admin saves revalidate on demand.
export const revalidate = 60 // keep in sync with CONTENT_REVALIDATE_SECONDS

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Arabic UI fonts: self-hosted by next/font, only fetched by the browser when Arabic text is shown.
const readex = Readex_Pro({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-readex',
  preload: false,
})
const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-tajawal',
  preload: false,
})

export const metadata: Metadata = {
  title: 'Your Name — Full-Stack Developer',
  description:
    'Personal portfolio of a full-stack developer crafting modern web experiences.',
  openGraph: {
    title: 'Your Name — Full-Stack Developer',
    description: 'Personal portfolio of a full-stack developer crafting modern web experiences.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#05060F' },
    { media: '(prefers-color-scheme: light)', color: '#f0f2f8' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialData = await getContentFromSupabase()
  
  return (
    <html lang="en" dir="ltr" data-scroll-behavior="smooth" suppressHydrationWarning className="bg-[--background]">
      <head>
        {initialData?.en?.meta?.favicon && (
          <link rel="icon" href={initialData.en.meta.favicon} />
        )}
      </head>
      <body className={`${inter.className} ${readex.variable} ${tajawal.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
            {initialData ? (
              <ContentProvider initialData={initialData}>
                <div className="fixed inset-0 pointer-events-none z-0" style={{ overflow: 'clip' }} aria-hidden="true">
                  <div
                    className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
                    style={{ background: 'var(--glow-violet)' }}
                  />
                  <div
                    className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-25"
                    style={{ background: 'var(--glow-cyan)' }}
                  />
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-10"
                    style={{ background: 'var(--gradient)' }}
                  />
                </div>
                <div className="relative z-10">{children}</div>
              </ContentProvider>
            ) : (
              <main className="min-h-screen flex items-center justify-center px-6 text-center text-slate-100">
                <div className="max-w-lg">
                  <h1 className="text-3xl font-bold">Portfolio content is unavailable</h1>
                  <p className="mt-4 text-slate-300">
                    Configure Supabase and add portfolio content to your database to display this site.
                  </p>
                </div>
              </main>
            )}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
