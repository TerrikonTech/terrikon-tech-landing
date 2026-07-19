import { useEffect, useRef, type RefObject } from 'react'

const ROW_1 = [
  'Сайты',
  'Веб-сервисы',
  'Приложения',
  'Telegram Mini Apps',
  'Карты',
  'Realtime',
]

const ROW_2 = [
  'Продуктовый дизайн',
  'Автоматизация',
  'Интеграции',
  '3D и WebGL',
  'Аналитика',
  'Поддержка',
]

interface MarqueeRowProps {
  items: string[]
  rowRef: RefObject<HTMLDivElement>
  outlined?: boolean
  initialOffset: string
}

function MarqueeRow({
  items,
  rowRef,
  outlined = false,
  initialOffset,
}: MarqueeRowProps) {
  const repeatedItems = [...items, ...items]

  return (
    <div
      ref={rowRef}
      aria-hidden="true"
      className="flex w-max items-center gap-5 px-[6vw] sm:gap-8"
      style={{
        transform: `translate3d(${initialOffset}, 0, 0)`,
        willChange: 'transform',
      }}
    >
      {repeatedItems.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="flex shrink-0 items-center gap-5 sm:gap-8"
        >
          <span
            className="whitespace-nowrap font-display font-black uppercase leading-none tracking-[-0.05em]"
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 7.5rem)',
              color: outlined ? 'transparent' : '#D7E2EA',
              WebkitTextStroke: outlined
                ? '1px rgba(215, 226, 234, 0.58)'
                : undefined,
            }}
          >
            {item}
          </span>
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#FF6A00] sm:h-3 sm:w-3" />
        </div>
      ))}
    </div>
  )
}

export default function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
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

      const progress = Math.min(
        Math.max((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0),
        1,
      )
      const travel = Math.min(window.innerWidth * 0.14, 180)

      row1.style.transform = `translate3d(${-travel + progress * travel}px, 0, 0)`
      row2.style.transform = `translate3d(${-travel * 0.35 - progress * travel}px, 0, 0)`
    }

    const handleViewportChange = () => {
      if (!rafId) rafId = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', handleViewportChange, { passive: true })
    window.addEventListener('resize', handleViewportChange, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleViewportChange)
      window.removeEventListener('resize', handleViewportChange)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-label="Направления разработки"
      className="overflow-hidden bg-[#0C0C0C] pb-12 pt-24 sm:pb-16 sm:pt-32 md:pt-40"
    >
      <div className="flex flex-col gap-4 sm:gap-6">
        <MarqueeRow
          items={ROW_1}
          rowRef={row1Ref}
          initialOffset="-12vw"
        />
        <MarqueeRow
          items={ROW_2}
          rowRef={row2Ref}
          outlined
          initialOffset="-5vw"
        />
      </div>
    </section>
  )
}
