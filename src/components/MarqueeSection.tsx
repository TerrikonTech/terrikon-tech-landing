import { useEffect, useRef, useState, type RefObject } from 'react'

export const MARQUEE_IMAGES = [
  'https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif',
  'https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif',
  'https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif',
  'https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif',
  'https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif',
  'https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif',
  'https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif',
  'https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif',
  'https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif',
  'https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif',
  'https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif',
  'https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif',
  'https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif',
  'https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif',
  'https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif',
  'https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif',
  'https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif',
  'https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif',
  'https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif',
]

export const MARQUEE_POSTERS = MARQUEE_IMAGES.map(
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
    // Не обновляем React-дерево из 20+ GIF на каждый scroll event:
    // браузеру достаточно одного transform в ближайшем animation frame.
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
      // растворение у краёв вьюпорта: ленты не обрываются жёстким срезом
      className="flex flex-col gap-3 bg-[#0C0C0C] pb-10 pt-24 [-webkit-mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] sm:pt-32 md:pt-40"
    >
      <MarqueeRow images={ROW_1} rowRef={row1Ref} />
      <MarqueeRow images={ROW_2} rowRef={row2Ref} />
    </section>
  )
}
