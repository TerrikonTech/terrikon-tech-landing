import { useEffect, useRef, useState } from 'react'
import FadeIn from './FadeIn'
import ContactButton from './ContactButton'
import ThemeSwitch from './ThemeSwitch'

const NAV_LINKS = ['About', 'Price', 'Projects', 'Contact']

// Локальные перекодировки: 1080p, all-intra (каждый кадр ключевой) —
// сик по любому времени декодирует ровно один кадр.
// Светлая тема — манекен из mainframe-hero, тёмная — лама из SynapseX.
const PORTRAIT_VIDEO_LIGHT = '/portrait-scrub.mp4'
const PORTRAIT_VIDEO_DARK = '/portrait-scrub-dark.mp4'

// Логика из mainframe-hero: видео не проигрывается само — кадр мотается
// только движением мыши. Автоплей остаётся лишь на тач-устройствах,
// где скраббинг курсором невозможен.
function ScrubVideo({ src }: { src: string }) {
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
    <div className="pointer-events-none relative order-last w-full overflow-hidden aspect-square md:aspect-video lg:absolute lg:inset-0 lg:z-0 lg:order-none lg:aspect-auto lg:h-full">
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        src={src}
        aria-label="Jack — 3D creator portrait"
        className="h-full w-full object-cover object-right lg:object-right-bottom"
      />
    </div>
  )
}

export default function HeroSection() {
  const [darkTheme, setDarkTheme] = useState(
    () => localStorage.getItem('jack-theme') === 'dark',
  )

  useEffect(() => {
    localStorage.setItem('jack-theme', darkTheme ? 'dark' : 'light')
  }, [darkTheme])

  // В светлой теме фон видео на lg светлый — текст hero затемняется;
  // в тёмной (лама на чёрном) текст остаётся светлым на всех ширинах
  const onLightBg = !darkTheme

  return (
    <section
      className="relative flex h-screen flex-col"
      style={{ overflowX: 'clip' }}
    >
      <ScrubVideo
        key={darkTheme ? 'dark' : 'light'}
        src={darkTheme ? PORTRAIT_VIDEO_DARK : PORTRAIT_VIDEO_LIGHT}
      />

      <div className="relative z-[5] flex flex-1 flex-col">
        <FadeIn delay={0} y={-20}>
          <nav className="flex items-center justify-between px-6 pt-6 md:px-10 md:pt-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className={`text-sm font-medium uppercase tracking-wider text-[#D7E2EA] transition-opacity duration-200 hover:opacity-70 md:text-lg lg:text-[1.4rem] ${onLightBg ? 'lg:text-[#0C0C0C]' : ''}`}
              >
                {link}
              </a>
            ))}
            <ThemeSwitch
              checked={darkTheme}
              onChange={setDarkTheme}
              onLightBg={onLightBg}
            />
          </nav>
        </FadeIn>

        <div className="overflow-hidden">
          <FadeIn delay={0.15} y={40}>
            <h1
              className={`hero-heading ${onLightBg ? 'hero-heading-on-video' : ''} mt-6 w-full whitespace-nowrap text-center text-[14vw] font-black uppercase leading-none tracking-tight sm:mt-4 sm:text-[15vw] md:-mt-5 md:text-[16vw] lg:text-[17.5vw]`}
            >
              Hi, i&apos;m jack
            </h1>
          </FadeIn>
        </div>

        <div className="mt-auto flex items-end justify-between px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
          <FadeIn delay={0.35} y={20}>
            <p
              className={`max-w-[160px] font-light uppercase leading-snug tracking-wide text-[#D7E2EA] sm:max-w-[220px] md:max-w-[260px] ${onLightBg ? 'lg:text-[#0C0C0C]' : ''}`}
              style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
            >
              a 3d creator driven by crafting striking and unforgettable
              projects
            </p>
          </FadeIn>
          <FadeIn delay={0.5} y={20}>
            <ContactButton />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
