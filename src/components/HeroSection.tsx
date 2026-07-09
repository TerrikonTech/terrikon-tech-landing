import { useEffect, useRef } from 'react'
import FadeIn from './FadeIn'
import ContactButton from './ContactButton'

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
        aria-label="Джек — видео-портрет 3D-художника"
        className="h-full w-full object-cover object-right lg:object-right-bottom"
      />
    </div>
  )
}

interface HeroSectionProps {
  darkTheme: boolean
}

export default function HeroSection({ darkTheme }: HeroSectionProps) {
  // В светлой теме фон видео на lg светлый — лейбл кнопки затемняется;
  // в тёмной (лама на чёрном) текст остаётся светлым на всех ширинах
  const onLightBg = !darkTheme

  return (
    <section
      id="top"
      className="relative flex h-screen flex-col"
      style={{ overflowX: 'clip' }}
    >
      <ScrubVideo
        key={darkTheme ? 'dark' : 'light'}
        src={darkTheme ? PORTRAIT_VIDEO_DARK : PORTRAIT_VIDEO_LIGHT}
      />

      <div className="relative z-[5] flex flex-1 flex-col">
        <div className="mt-auto flex items-end justify-end px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
          <FadeIn delay={0.5} y={20}>
            <ContactButton onLightBg={onLightBg} />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
