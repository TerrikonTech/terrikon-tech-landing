import { useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import HeroSection from './components/HeroSection'
import MarqueeSection from './components/MarqueeSection'
import AboutSection from './components/AboutSection'
import ServicesSection from './components/ServicesSection'
import ProjectsSection from './components/ProjectsSection'
import TeamSection from './components/TeamSection'
import TerrikonRidge from './components/TerrikonRidge'
import Footer from './components/Footer'

export default function App() {
  // Тёмная — дефолт: светлая только если выбрана явно
  const [darkTheme, setDarkTheme] = useState(
    () => localStorage.getItem('jack-theme') !== 'light',
  )

  useEffect(() => {
    localStorage.setItem('jack-theme', darkTheme ? 'dark' : 'light')
  }, [darkTheme])

  return (
    // reducedMotion="user": все framer-motion анимации гасятся системной
    // настройкой «уменьшить движение» (WCAG 2.3.3)
    <MotionConfig reducedMotion="user">
      <main
        className="min-h-screen bg-[#0C0C0C] font-sans"
        style={{ overflowX: 'clip' }}
      >
        <HeroSection darkTheme={darkTheme} onToggleTheme={setDarkTheme} />
        <MarqueeSection />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
        <TeamSection />
        <TerrikonRidge />
        <Footer />
      </main>
    </MotionConfig>
  )
}
