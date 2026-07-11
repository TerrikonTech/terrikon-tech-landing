import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import FadeIn from './FadeIn'
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

// Локальные перекодировки: 1080p, all-intra (каждый кадр ключевой) —
// сик по любому времени декодирует ровно один кадр.
// Светлая тема — манекен из mainframe-hero, тёмная — лама из SynapseX.
const PORTRAIT_VIDEO_LIGHT = '/portrait-scrub.mp4'
const PORTRAIT_VIDEO_DARK = '/portrait-scrub-dark.mp4'

// Логика из mainframe-hero: видео не проигрывается само — кадр мотается
// только движением мыши. Автоплей остаётся лишь на тач-устройствах,
// где скраббинг курсором невозможен.
function ScrubVideo({ src, dark }: { src: string; dark: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (window.matchMedia('(pointer: coarse)').matches) {
      video.autoplay = true
      video.loop = true
      video.play().catch(() => {})
      return
    }

    let targetTime = 0
    let prevX: number | null = null
    let seeking = false
    let rafId = 0

    const onSeeked = () => {
      seeking = false
    }

    // mousemove только копит целевое время; сам сик — максимум раз в кадр
    // и только когда предыдущий завершился, иначе очередь сиков душит декодер
    const onMouseMove = (e: MouseEvent) => {
      if (prevX === null) {
        prevX = e.clientX
        return
      }
      const delta = e.clientX - prevX
      prevX = e.clientX
      if (!video.duration) return
      const next = targetTime + (delta / window.innerWidth) * 0.8 * video.duration
      targetTime = Math.min(Math.max(next, 0), video.duration)
    }

    const tick = () => {
      rafId = requestAnimationFrame(tick)
      if (seeking || !video.duration) return
      if (Math.abs(targetTime - video.currentTime) < 1 / 30) return
      seeking = true
      video.currentTime = targetTime
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    video.addEventListener('seeked', onSeeked)
    rafId = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      video.removeEventListener('seeked', onSeeked)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      {/* Видео — фон всего hero на всех ширинах (раньше на мобиле было
          отдельным блоком под текстом — композиция разваливалась) */}
      <div className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          src={src}
          aria-label="Террикон Тех — видео-портрет"
          className={`h-full w-full object-cover lg:object-right-top ${
            // мобильный кроп: лама стоит в центре кадра, манекен — правее (~68%);
            // общий object-right резал ламу пополам.
            // lg-якорь top (не bottom): на окнах шире 16:9 запас кропа
            // вертикальный, и с якорем bottom голова прижималась к верху,
            // залезая под навбар — с top фигура опускается, режется низ.
            // Тёмная на окнах шире 16:9 — contain по высоте с центровкой:
            // cover раздувал ламу (плечи под обрезом); фон видео чёрный,
            // боковые поля сливаются с фоном секции. В точке 16:9
            // contain == cover — переход бесшовный
            // + растворение боковых краёв: фон видео чуть светлее #0C0C0C,
            // без маски виден вертикальный стык на полях contain
            dark
              ? 'object-center [@media(min-aspect-ratio:16/9)]:lg:object-contain [@media(min-aspect-ratio:16/9)]:lg:object-top [@media(min-aspect-ratio:16/9)]:lg:[-webkit-mask-image:linear-gradient(to_right,transparent_10%,black_24%,black_76%,transparent_90%)] [@media(min-aspect-ratio:16/9)]:lg:[mask-image:linear-gradient(to_right,transparent_10%,black_24%,black_76%,transparent_90%)]'
              : 'object-[68%_50%]'
          }`}
        />
      </div>
      <SubjectKeyCanvas videoRef={videoRef} dark={dark} />
    </>
  )
}

interface HeroSectionProps {
  darkTheme: boolean
  onToggleTheme: (dark: boolean) => void
}

export default function HeroSection({
  darkTheme,
  onToggleTheme,
}: HeroSectionProps) {
  // В светлой теме фон видео на lg светлый — текст hero затемняется;
  // в тёмной (лама на чёрном) текст остаётся светлым на всех ширинах
  const onLightBg = !darkTheme

  // Скраб — главная интерактивная фича hero, но без подсказки необнаружима:
  // хинт всплывает, если мышь не двигалась первые ~2.5 с, и тает при
  // первом движении (двигал раньше — уже скрабит, хинт не нужен)
  const [hintVisible, setHintVisible] = useState(false)
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const timer = window.setTimeout(() => setHintVisible(true), 2600)
    const onMove = () => {
      window.clearTimeout(timer)
      setHintVisible(false)
      window.removeEventListener('mousemove', onMove)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <section
      id="top"
      className="relative isolate flex h-screen flex-col"
      style={{ overflowX: 'clip' }}
    >
      {/* На lg заголовок лежит МЕЖДУ видео и канвасом-вырезкой:
          видео z-0, текст z-1, SubjectKeyCanvas z-2 рисует только фигуру
          (кеинг по цвету фона) — голова перекрывает буквы. */}
      <ScrubVideo
        key={darkTheme ? 'dark' : 'light'}
        src={darkTheme ? PORTRAIT_VIDEO_DARK : PORTRAIT_VIDEO_LIGHT}
        dark={darkTheme}
      />

      <div className="relative flex flex-1 flex-col">
        <FadeIn delay={0} y={-20} className="relative z-10">
          <nav className="flex items-center justify-between px-6 pt-6 md:px-10 md:pt-8">
            <a href="#top" aria-label="Наверх">
              <LogoMark
                className={`h-6 w-7 transition-opacity duration-200 hover:opacity-70 md:h-8 md:w-9 ${onLightBg ? 'bg-black' : 'bg-[#BBCCD7]'}`}
              />
            </a>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`relative whitespace-nowrap text-[11px] font-medium uppercase tracking-wider after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[#FF6A00] after:transition-transform after:duration-300 hover:after:scale-x-100 sm:text-sm md:text-lg lg:text-[1.4rem] ${onLightBg ? 'text-[#0C0C0C]' : 'text-[#D7E2EA]'}`}
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
        </FadeIn>

        <div className="relative z-[1] overflow-hidden">
          <FadeIn delay={0.15} y={40}>
            <h1
              className={`hero-heading ${onLightBg ? 'hero-heading-on-video' : ''} mt-6 w-full whitespace-nowrap text-center font-display text-[11.2vw] font-black leading-none tracking-tight sm:mt-4 md:-mt-5`}
            >
              Террикон Тех
            </h1>
          </FadeIn>
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
          <FadeIn delay={0.35} y={20}>
            <p
              className={`max-w-[180px] font-normal leading-snug sm:max-w-[240px] md:max-w-[280px] ${onLightBg ? 'text-[#0C0C0C]' : 'text-[#D7E2EA]'}`}
              style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
            >
              Простые парни, одержимые созданием ярких и незабываемых
              проектов
            </p>
          </FadeIn>
          <FadeIn delay={0.5} y={20}>
            <ContactButton variant="glass" onLightBg={onLightBg} />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
