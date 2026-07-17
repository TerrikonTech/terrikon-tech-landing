import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import FadeIn from './FadeIn'
import ContactButton from './ContactButton'
import { MARQUEE_IMAGES, MARQUEE_POSTERS } from './MarqueeSection'

interface Project {
  number: string
  name: string
  category: string
  media: string
  poster: string
}

// Одна карточка — один живой GIF-превью из секции-марки;
// названия подобраны под содержимое роликов
const PROJECTS: Project[] = [
  {
    number: '01',
    name: 'Space Voyage',
    category: 'Клиент',
    media: MARQUEE_IMAGES[0],
    poster: MARQUEE_POSTERS[0],
  },
  {
    number: '02',
    name: 'CodeNest',
    category: 'Клиент',
    media: MARQUEE_IMAGES[1],
    poster: MARQUEE_POSTERS[1],
  },
  {
    number: '03',
    name: 'Vex Ventures',
    category: 'Личный',
    media: MARQUEE_IMAGES[2],
    poster: MARQUEE_POSTERS[2],
  },
  {
    number: '04',
    name: 'Stellar AI',
    category: 'Клиент',
    media: MARQUEE_IMAGES[3],
    poster: MARQUEE_POSTERS[3],
  },
  {
    number: '05',
    name: 'ASME',
    category: 'Личный',
    media: MARQUEE_IMAGES[4],
    poster: MARQUEE_POSTERS[4],
  },
]

function ProjectMedia({
  src,
  poster,
  alt,
  active,
}: {
  src: string
  poster: string
  alt: string
  active: boolean
}) {
  return (
    <img
      src={active ? src : poster}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="w-full rounded-2xl bg-white/5 object-cover"
      style={{ height: 'clamp(240px, 34vw, 440px)' }}
    />
  )
}

interface ProjectCardProps {
  project: Project
  index: number
  totalCards: number
  progress: MotionValue<number>
  active: boolean
}

function ProjectCard({
  project,
  index,
  totalCards,
  progress,
  active,
}: ProjectCardProps) {
  const targetScale = 1 - (totalCards - 1 - index) * 0.03
  const scale = useTransform(progress, [index / totalCards, 1], [1, targetScale])

  return (
    // min-h вместо жёсткой высоты: на низких/широких окнах карточка выше
    // 85vh и вылезала из слота, накрывая CTA после секции; marginTop
    // вместо top — чтобы смещение стопки учитывалось в высоте слота
    <div className="sticky top-24 min-h-[85vh] md:top-32">
      <motion.div
        className="relative rounded-[20px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:rounded-[24px] sm:p-6 md:rounded-[28px] md:p-8"
        style={{ scale, marginTop: `${index * 28}px` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
            <span
              className="font-display font-black leading-none text-[#D7E2EA]"
              style={{ fontSize: 'clamp(2.6rem, 8.5vw, 120px)' }}
            >
              {project.number}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-normal uppercase tracking-widest text-[#D7E2EA] opacity-60 sm:text-sm">
                {project.category}
              </span>
              <h3
                className="font-display font-semibold text-[#D7E2EA]"
                style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.9rem)' }}
              >
                {project.name}
              </h3>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 md:mt-8">
          <ProjectMedia
            src={project.media}
            poster={project.poster}
            alt={`${project.name} — превью проекта`}
            active={active}
          />
        </div>
      </motion.div>
    </div>
  )
}

export default function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })
  const [sectionNear, setSectionNear] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !('IntersectionObserver' in window)) {
      setSectionNear(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setSectionNear(entry.isIntersecting),
      { rootMargin: '400px 0px' },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = Math.min(
      PROJECTS.length - 1,
      Math.max(0, Math.floor(value * PROJECTS.length)),
    )
    setActiveIndex((current) => (current === next ? current : next))
  })

  return (
    <section
      id="projects"
      className="relative z-10 -mt-10 rounded-t-[40px] bg-[#0C0C0C] px-5 pb-20 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pt-32"
    >
      <FadeIn y={40}>
        <h2
          className="hero-heading mb-16 text-center font-display font-black leading-none tracking-tight sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Проекты
        </h2>
      </FadeIn>

      <div ref={containerRef} className="mx-auto max-w-6xl">
        {PROJECTS.map((project, index) => (
          <ProjectCard
            key={project.number}
            project={project}
            index={index}
            totalCards={PROJECTS.length}
            progress={scrollYProgress}
            active={sectionNear && activeIndex === index}
          />
        ))}
      </div>

      {/* CTA сразу после кейсов — пик намерения; relative z-10 — sticky-
          карточки позиционированы и иначе красятся поверх статичного текста */}
      <FadeIn delay={0.1}>
        <div className="relative z-10 flex flex-col items-center gap-6 pt-24 text-center sm:pt-32">
          <p
            className="max-w-xl font-normal leading-relaxed text-[#D7E2EA]/70"
            style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.35rem)' }}
          >
            Хотите так же? Напишите — обсудим ваш проект и предложим план.
          </p>
          <ContactButton>Написать в Telegram</ContactButton>
        </div>
      </FadeIn>
    </section>
  )
}
