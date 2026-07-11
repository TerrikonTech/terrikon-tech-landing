import { useEffect, useRef } from 'react'
import FadeIn from './FadeIn'
import ContactButton from './ContactButton'
import SubjectKeyCanvas from './SubjectKeyCanvas'
import ThemeSwitch from './ThemeSwitch'
import LogoMark from './LogoMark'

const NAV_LINKS = [
  { label: 'О нас', href: '#about' },
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
      <div className="pointer-events-none relative order-last w-full overflow-hidden aspect-square md:aspect-video lg:absolute lg:inset-0 lg:z-0 lg:order-none lg:aspect-auto lg:h-full">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          src={src}
          aria-label="Террикон Тех — видео-портрет"
          className={`h-full w-full object-cover lg:object-right-bottom ${
            // мобильный кроп: лама стоит в центре кадра, манекен — правее (~68%);
            // общий object-right резал ламу пополам
            dark ? 'object-center' : 'object-[68%_50%]'
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
                className={`h-6 w-7 transition-opacity duration-200 hover:opacity-70 md:h-8 md:w-9 ${onLightBg ? 'bg-[#BBCCD7] lg:bg-black' : 'bg-[#BBCCD7]'}`}
              />
            </a>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap text-[11px] font-medium uppercase tracking-wider text-[#D7E2EA] transition-opacity duration-200 hover:opacity-70 sm:text-sm md:text-lg lg:text-[1.4rem] ${onLightBg ? 'lg:text-[#0C0C0C]' : ''}`}
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

        <div className="relative z-10 mt-auto flex items-end justify-between px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
          <FadeIn delay={0.35} y={20}>
            <p
              className={`max-w-[180px] font-normal leading-snug text-[#D7E2EA] sm:max-w-[240px] md:max-w-[280px] ${onLightBg ? 'lg:text-[#0C0C0C]' : ''}`}
              style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
            >
              Простые парни, одержимые созданием ярких и незабываемых
              проектов
            </p>
          </FadeIn>
          <FadeIn delay={0.5} y={20}>
            <ContactButton onLightBg={onLightBg} />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
