import { useEffect, useRef, useState, type RefObject } from 'react'

export const MARQUEE_POSTERS = Array.from(
  { length: 21 },
  (_, index) => `/marquee/${String(index + 1).padStart(2, '0')}.webp`,
)

const ROW_1 = MARQUEE_POSTERS.slice(0, 11)
const ROW_2 = MARQUEE_POSTERS.slice(11)

function DeferredMarqueeImage({ src }: { src: string }) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const image = imageRef.current
    if (!image || !('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '160px' },
    )
    observer.observe(image)
    return () => observer.disconnect()
  }, [])

  return (
    <img
      ref={imageRef}
      src={visible ? src : undefined}
      alt=""
      loading="lazy"
      decoding="async"
      className="rounded-2xl bg-white/5 object-cover"
      style={{ width: 420, height: 270, flexShrink: 0 }}
    />
  )
}

interface MarqueeRowProps {
  images: string[]
  rowRef: RefObject<HTMLDivElement>
}

function MarqueeRow({ images, rowRef }: MarqueeRowProps) {
  return (
    <div
      ref={rowRef}
      className="flex justify-center gap-3"
      style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}
    >
      {images.map((src) => (
        <DeferredMarqueeImage key={src} src={src} />
      ))}
    </div>
  )
}

export default function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Ленты используют только локальные WebP-постеры. Двигаем готовые
    // слои один раз за animation frame и полностью гасим эффект при
    // системной настройке reduced motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let rafId = 0
    const update = () => {
      rafId = 0
      const section = sectionRef.current
      const row1 = row1Ref.current
      const row2 = row2Ref.current
      if (!section || !row1 || !row2) return
      const rect = section.getBoundingClientRect()
      if (rect.bottom < -window.innerHeight || rect.top > window.innerHeight * 2) {
        return
      }
      const offset =
        (window.scrollY - section.offsetTop + window.innerHeight) * 0.3 - 200
      row1.style.transform = `translate3d(${offset}px, 0, 0)`
      row2.style.transform = `translate3d(${-offset}px, 0, 0)`
    }
    const handleScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-label="Визуальная подборка работ"
      className="flex flex-col gap-3 bg-[#0C0C0C] pb-10 pt-24 [-webkit-mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] sm:pt-32 md:pt-40"
    >
      <MarqueeRow images={ROW_1} rowRef={row1Ref} />
      <MarqueeRow images={ROW_2} rowRef={row2Ref} />
    </section>
  )
}
