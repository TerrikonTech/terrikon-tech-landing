import { useEffect, useState } from 'react'
import Preloader from './components/Preloader'
import DockNav from './components/DockNav'
import HeroSection from './components/HeroSection'
import MarqueeSection from './components/MarqueeSection'
import AboutSection from './components/AboutSection'
import ServicesSection from './components/ServicesSection'
import ProjectsSection from './components/ProjectsSection'
import TeamSection from './components/TeamSection'
import Footer from './components/Footer'

export default function App() {
  const [darkTheme, setDarkTheme] = useState(
    () => localStorage.getItem('jack-theme') === 'dark',
  )

  useEffect(() => {
    localStorage.setItem('jack-theme', darkTheme ? 'dark' : 'light')
  }, [darkTheme])

  return (
    <main
      className="min-h-screen bg-[#0C0C0C] font-display"
      style={{ overflowX: 'clip' }}
    >
      <Preloader />
      <DockNav
        darkTheme={darkTheme}
        onToggleTheme={() => setDarkTheme((v) => !v)}
      />
      <HeroSection darkTheme={darkTheme} />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <TeamSection />
      <Footer />
    </main>
  )
}
