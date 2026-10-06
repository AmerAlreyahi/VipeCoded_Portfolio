import type { Metadata } from 'next'
import { getContentFromSupabase } from '@/lib/getContentFromSupabase'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Skills from '@/components/Skills'
import Projects from '@/components/Projects'
import Career from '@/components/Career'
import Social from '@/components/Social'
import Footer from '@/components/Footer'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContentFromSupabase()
  const title = content?.en?.meta?.title || 'Your Name — Full-Stack Developer'
  const description = content?.en?.meta?.description || 'Personal portfolio of a full-stack developer'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Career />
      <Social />
      <Footer />
    </main>
  )
}
