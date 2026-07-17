import { useEffect, useRef, useState } from 'react'

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

const ROW_1 = MARQUEE_IMAGES.slice(0, 11)
const ROW_2 = MARQUEE_IMAGES.slice(11)

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
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      { rootMargin: '200px' },
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
  transform: string
}

function MarqueeRow({ images, transform }: MarqueeRowProps) {
  const tripled = [...images, ...images, ...images]
  return (
    <div
      className="flex justify-center gap-3"
      style={{ transform, willChange: 'transform' }}
    >
      {tripled.map((src, i) => (
        <DeferredMarqueeImage key={i} src={src} />
      ))}
    </div>
  )
}

export default function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    // параллакс — чистая декорация: при «уменьшить движение» ленты статичны
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const handleScroll = () => {
      if (!sectionRef.current) return
      const sectionTop = sectionRef.current.offsetTop
      setOffset((window.scrollY - sectionTop + window.innerHeight) * 0.3)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      // растворение у краёв вьюпорта: ленты не обрываются жёстким срезом
      className="flex flex-col gap-3 bg-[#0C0C0C] pb-10 pt-24 [-webkit-mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] sm:pt-32 md:pt-40"
    >
      <MarqueeRow images={ROW_1} transform={`translateX(${offset - 200}px)`} />
      <MarqueeRow
        images={ROW_2}
        transform={`translateX(${-(offset - 200)}px)`}
      />
    </section>
  )
}
