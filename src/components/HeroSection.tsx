import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ContactButton from './ContactButton'
import SubjectKeyCanvas from './SubjectKeyCanvas'
import ThemeSwitch from './ThemeSwitch'
import LogoMark from './LogoMark'

const NAV_LINKS = [
  { label: 'О нас', href: '#about' },
  { label: 'Услуги', href: '#services' },
  { label: 'Проекты', href: '#projects' },
  { label: 'Контакт', href: '#contact' },
]

interface HeroSectionProps {
  darkTheme: boolean
  onToggleTheme: (dark: boolean) => void
}

export default function HeroSection({
  darkTheme,
  onToggleTheme,
}: HeroSectionProps) {
  const onLightBg = !darkTheme

  // Подсказка нужна только там, где интерактивный атлас действительно
  // включён: точный указатель, без reduced-motion и Save-Data.
  const [hintVisible, setHintVisible] = useState(false)
  useEffect(() => {
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean }
      }
    ).connection
    if (
      !window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      connection?.saveData
    ) {
      return
    }

    const timer = window.setTimeout(() => setHintVisible(true), 2600)
    const onMove = () => {
      window.clearTimeout(timer)
      setHintVisible(false)
      window.removeEventListener('pointermove', onMove)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <section
      id="top"
      className="relative isolate flex h-screen flex-col"
      style={{
        overflowX: 'clip',
        backgroundColor: darkTheme ? '#0C0C0C' : '#F2F0F8',
      }}
    >
      {/* Два синхронных запечённых атласа: полный кадр z-0,
          заголовок z-1, прозрачная фигура z-2. Лама остаётся поверх букв,
          а mousemove не вызывает video seek или runtime WebGL. */}
      <SubjectKeyCanvas
        key={darkTheme ? 'dark' : 'light'}
        dark={darkTheme}
      />

      <div className="relative flex flex-1 flex-col">
        <div className="relative z-10">
          <nav className="flex items-center justify-between px-6 pt-6 md:px-10 md:pt-8">
            <a href="#top" aria-label="Наверх">
              <LogoMark
                className={`h-6 w-7 transition-opacity duration-200 hover:opacity-70 md:h-8 md:w-9 ${
                  onLightBg ? 'bg-black' : 'bg-[#BBCCD7]'
                }`}
              />
            </a>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`relative whitespace-nowrap text-[11px] font-medium uppercase tracking-wider after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[#FF6A00] after:transition-transform after:duration-300 hover:after:scale-x-100 sm:text-sm md:text-lg lg:text-[1.4rem] ${
                  onLightBg ? 'text-[#0C0C0C]' : 'text-[#D7E2EA]'
                }`}
              >
                {link.label}
              </a>
            ))}
            <ThemeSwitch
              checked={darkTheme}
              onChange={onToggleTheme}
              onLightBg={onLightBg}
            />
          </nav>
        </div>

        <div className="relative z-[1] overflow-hidden">
          <div>
            <h1
              className={`hero-heading ${
                onLightBg ? 'hero-heading-on-video' : ''
              } mt-6 w-full whitespace-nowrap text-center font-display text-[11.2vw] font-black leading-none tracking-tight sm:mt-4 md:-mt-5`}
            >
              Террикон Тех
            </h1>
          </div>
        </div>

        <AnimatePresence>
          {hintVisible && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`pointer-events-none absolute bottom-28 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-widest backdrop-blur-sm lg:flex ${
                onLightBg
                  ? 'border-black/15 bg-white/30 text-black/70'
                  : 'border-white/15 bg-white/5 text-[#D7E2EA]/80'
              }`}
            >
              ← поводите мышью →
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 mt-auto flex items-end justify-between px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
          <div>
            <p
              className={`max-w-[180px] font-normal leading-snug sm:max-w-[240px] md:max-w-[280px] ${
                onLightBg ? 'text-[#0C0C0C]' : 'text-[#D7E2EA]'
              }`}
              style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
            >
              Создаём сайты и цифровые продукты в Донецке и по всей России
            </p>
          </div>
          <div>
            <ContactButton variant="glass" onLightBg={onLightBg} />
          </div>
        </div>
      </div>
    </section>
  )
}
