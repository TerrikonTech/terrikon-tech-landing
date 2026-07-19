import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import FadeIn from './FadeIn'
import ContactButton from './ContactButton'
import { MARQUEE_POSTERS } from './MarqueeSection'

interface Project {
  number: string
  name: string
  category: string
  poster: string
}

// Владелец подтвердил текущий состав и порядок проектов. Карточки не
// подменяем другими продуктами и не расширяем неподтверждёнными фактами.
const PROJECTS: Project[] = [
  {
    number: '01',
    name: 'Space Voyage',
    category: 'Клиент',
    poster: MARQUEE_POSTERS[0],
  },
  {
    number: '02',
    name: 'CodeNest',
    category: 'Клиент',
    poster: MARQUEE_POSTERS[1],
  },
  {
    number: '03',
    name: 'Vex Ventures',
    category: 'Личный',
    poster: MARQUEE_POSTERS[2],
  },
  {
    number: '04',
    name: 'Stellar AI',
    category: 'Клиент',
    poster: MARQUEE_POSTERS[3],
  },
  {
    number: '05',
    name: 'ASME',
    category: 'Личный',
    poster: MARQUEE_POSTERS[4],
  },
]

function ProjectMedia({ poster, alt }: { poster: string; alt: string }) {
  return (
    <div className="group/media relative overflow-hidden rounded-2xl bg-white/5">
      <motion.img
        src={poster}
        alt={alt}
        loading="lazy"
        decoding="async"
        whileHover={{ scale: 1.025 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full object-cover"
        style={{ height: 'clamp(240px, 34vw, 440px)' }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 transition-colors duration-300 group-hover/media:ring-white/25"
      />
    </div>
  )
}

interface ProjectCardProps {
  project: Project
  index: number
  totalCards: number
  progress: MotionValue<number>
}

function ProjectCard({
  project,
  index,
  totalCards,
  progress,
}: ProjectCardProps) {
  const targetScale = 1 - (totalCards - 1 - index) * 0.03
  const scale = useTransform(progress, [index / totalCards, 1], [1, targetScale])

  return (
    <div className="sticky top-24 min-h-[85vh] md:top-32">
      <motion.article
        className="relative rounded-[20px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:rounded-[24px] sm:p-6 md:rounded-[28px] md:p-8"
        style={{ scale, marginTop: `${index * 28}px` }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
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
            poster={project.poster}
            alt={`${project.name} — превью проекта`}
          />
        </div>
      </motion.article>
    </div>
  )
}

export default function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
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
          />
        ))}
      </div>

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
