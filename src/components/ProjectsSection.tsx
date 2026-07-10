import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import FadeIn from './FadeIn'
import { MARQUEE_IMAGES } from './MarqueeSection'

interface Project {
  number: string
  name: string
  category: string
  media: string
}

// Одна карточка — один живой GIF-превью из секции-марки;
// названия подобраны под содержимое роликов
const PROJECTS: Project[] = [
  { number: '01', name: 'Space Voyage', category: 'Клиент', media: MARQUEE_IMAGES[0] },
  { number: '02', name: 'CodeNest', category: 'Клиент', media: MARQUEE_IMAGES[1] },
  { number: '03', name: 'Vex Ventures', category: 'Личный', media: MARQUEE_IMAGES[2] },
  { number: '04', name: 'Stellar AI', category: 'Клиент', media: MARQUEE_IMAGES[3] },
  { number: '05', name: 'ASME', category: 'Личный', media: MARQUEE_IMAGES[4] },
]

interface ProjectCardProps {
  project: Project
  index: number
  totalCards: number
  progress: MotionValue<number>
}

function ProjectCard({ project, index, totalCards, progress }: ProjectCardProps) {
  const targetScale = 1 - (totalCards - 1 - index) * 0.03
  const scale = useTransform(progress, [index / totalCards, 1], [1, targetScale])

  return (
    <div className="sticky top-24 h-[85vh] md:top-32">
      <motion.div
        className="relative rounded-[20px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:rounded-[24px] sm:p-6 md:rounded-[28px] md:p-8"
        style={{ scale, top: `${index * 28}px` }}
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
          <img
            src={project.media}
            alt={`${project.name} — превью проекта`}
            loading="lazy"
            className="w-full rounded-2xl object-cover"
            style={{ height: 'clamp(240px, 34vw, 440px)' }}
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
    </section>
  )
}
