import { useEffect, useRef } from 'react'
import FadeIn from './FadeIn'
import ContactButton from './ContactButton'

const NAV_LINKS = ['About', 'Price', 'Projects', 'Contact']

const PORTRAIT_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4'

// Логика из mainframe-hero: на десктопе видео скраббится горизонтальным
// движением мыши, ниже 1024px — обычный автоплей.
function ScrubVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const targetTimeRef = useRef(0)
  const prevXRef = useRef<number | null>(null)
  const seekingRef = useRef(false)

  // Desktop mouse scrubbing
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const applySeek = () => {
      if (!video.duration) return
      seekingRef.current = true
      video.currentTime = targetTimeRef.current
    }

    const onSeeked = () => {
      seekingRef.current = false
      if (Math.abs(video.currentTime - targetTimeRef.current) > 0.01) {
        applySeek()
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return
      if (prevXRef.current === null) {
        prevXRef.current = e.clientX
        return
      }
      const delta = e.clientX - prevXRef.current
      prevXRef.current = e.clientX
      if (!video.duration) return
      const next =
        targetTimeRef.current + (delta / window.innerWidth) * 0.8 * video.duration
      targetTimeRef.current = Math.min(Math.max(next, 0), video.duration)
      if (!seekingRef.current) applySeek()
    }

    window.addEventListener('mousemove', onMouseMove)
    video.addEventListener('seeked', onSeeked)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      video.removeEventListener('seeked', onSeeked)
    }
  }, [])

  // Mobile autoplay — scrubbing is disabled below 1024px, so play normally
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (window.innerWidth < 1024) {
      video.autoplay = true
      video.loop = true
      video.play().catch(() => {})
    }
  }, [])

  return (
    <div className="pointer-events-none relative order-last w-full overflow-hidden aspect-square md:aspect-video lg:absolute lg:inset-0 lg:z-0 lg:order-none lg:aspect-auto lg:h-full">
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        src={PORTRAIT_VIDEO_URL}
        aria-label="Jack — 3D creator portrait"
        className="h-full w-full object-cover object-right lg:object-right-bottom"
      />
    </div>
  )
}

export default function HeroSection() {
  return (
    <section
      className="relative flex h-screen flex-col"
      style={{ overflowX: 'clip' }}
    >
      <ScrubVideo />

      <div className="relative z-[5] flex flex-1 flex-col">
        <FadeIn delay={0} y={-20}>
          <nav className="flex justify-between px-6 pt-6 md:px-10 md:pt-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm font-medium uppercase tracking-wider text-[#D7E2EA] transition-opacity duration-200 hover:opacity-70 md:text-lg lg:text-[1.4rem] lg:text-[#0C0C0C]"
              >
                {link}
              </a>
            ))}
          </nav>
        </FadeIn>

        <div className="overflow-hidden">
          <FadeIn delay={0.15} y={40}>
            <h1 className="hero-heading hero-heading-on-video mt-6 w-full whitespace-nowrap text-center text-[14vw] font-black uppercase leading-none tracking-tight sm:mt-4 sm:text-[15vw] md:-mt-5 md:text-[16vw] lg:text-[17.5vw]">
              Hi, i&apos;m jack
            </h1>
          </FadeIn>
        </div>

        <div className="mt-auto flex items-end justify-between px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
          <FadeIn delay={0.35} y={20}>
            <p
              className="max-w-[160px] font-light uppercase leading-snug tracking-wide text-[#D7E2EA] sm:max-w-[220px] md:max-w-[260px] lg:text-[#0C0C0C]"
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
