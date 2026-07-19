import { useRef } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import FadeIn from './FadeIn'
import ContactButton from './ContactButton'

interface Project {
  number: string
  name: string
  category: string
  description: string
  url: string
  poster: string
  alt: string
  tags: string[]
  mediaClassName: string
}

const PROJECTS: Project[] = [
  {
    number: '01',
    name: 'GasTracker',
    category: 'Городской сервис',
    description:
      'Карта наличия топлива в Донецке и ДНР с фильтрами, отметками пользователей и уведомлениями.',
    url: 'https://www.gastracker.ru/',
    poster: '/projects/gastracker.jpg',
    alt: 'Интерфейс карты GasTracker для Донецка и ДНР',
    tags: ['Карта', 'Realtime', 'PWA'],
    mediaClassName: 'w-[155%] object-left',
  },
  {
    number: '02',
    name: 'Купеческие Яства',
    category: 'Сайт + Telegram',
    description:
      'Витрина мясной лавки с каталогом, оформлением заказа и связанным Telegram-ботом.',
    url: 'https://meat-donetsk.ru/',
    poster: '/projects/kupecheskie-yastva.jpg',
    alt: 'Главная страница сайта Купеческие Яства',
    tags: ['Витрина', 'Каталог', 'Telegram'],
    mediaClassName: 'w-full object-center',
  },
]

function ProjectMedia({
  project,
  reduceMotion,
}: {
  project: Project
  reduceMotion: boolean
}) {
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Открыть проект ${project.name}`}
      className="group/media relative block min-h-[320px] overflow-hidden rounded-2xl bg-white/5 outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0C0C0C] sm:min-h-[420px] lg:min-h-[560px]"
    >
      <motion.div
        className="absolute inset-0 origin-left"
        whileHover={reduceMotion ? undefined : { scale: 1.025 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <img
          src={project.poster}
          alt={project.alt}
          loading="lazy"
          decoding="async"
          className={`absolute inset-y-0 left-0 h-full max-w-none object-cover ${project.mediaClassName}`}
        />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
      <span className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md transition-colors duration-300 group-hover/media:border-white/45 sm:right-5 sm:top-5">
        Смотреть
        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
      </span>
    </a>
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
  const reduceMotion = useReducedMotion() ?? false
  const targetScale = 1 - (totalCards - 1 - index) * 0.03
  const scale = useTransform(progress, [index / totalCards, 1], [1, targetScale])

  return (
    <div className="relative mb-8 md:sticky md:top-24 md:min-h-[88vh] md:mb-0">
      <motion.article
        className="relative rounded-[24px] border border-[#D7E2EA]/45 bg-[#111214] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:p-6 md:rounded-[32px] md:p-8"
        style={{
          scale: reduceMotion ? 1 : scale,
          marginTop: `${index * 24}px`,
          transformOrigin: 'top center',
        }}
        whileHover={reduceMotion ? undefined : { y: -4 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-10">
          <div className="flex min-h-[320px] flex-col justify-between py-1 sm:min-h-[360px] lg:min-h-0 lg:py-3">
            <div>
              <div className="flex items-center justify-between gap-5">
                <span
                  className="font-display font-black leading-none text-[#D7E2EA]"
                  style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}
                >
                  {project.number}
                </span>
                <span className="text-right text-xs font-semibold uppercase tracking-[0.18em] text-[#FF6A00] sm:text-sm">
                  {project.category}
                </span>
              </div>

              <h3
                className="mt-10 font-display font-bold leading-[1.02] text-[#D7E2EA]"
                style={{ fontSize: 'clamp(1.8rem, 3.4vw, 3.5rem)' }}
              >
                {project.name}
              </h3>
              <p className="mt-6 max-w-md text-base leading-relaxed text-[#D7E2EA]/70 sm:text-lg">
                {project.description}
              </p>

              <ul className="mt-8 flex flex-wrap gap-2" aria-label="Особенности проекта">
                {project.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-[#D7E2EA]/20 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-[#D7E2EA]/70"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>

            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link mt-12 inline-flex w-fit items-center gap-3 font-semibold text-[#D7E2EA] outline-none transition-colors hover:text-[#FF6A00] focus-visible:ring-2 focus-visible:ring-[#FF6A00] focus-visible:ring-offset-4 focus-visible:ring-offset-[#111214]"
            >
              Открыть живой проект
              <ArrowUpRight
                aria-hidden="true"
                className="h-5 w-5 transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
              />
            </a>
          </div>

          <ProjectMedia project={project} reduceMotion={reduceMotion} />
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
        <div className="mx-auto mb-16 flex max-w-6xl flex-col gap-7 sm:mb-20 md:mb-28 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#FF6A00] sm:text-sm">
              Работает прямо сейчас
            </p>
            <h2
              className="hero-heading font-display font-black leading-none tracking-tight"
              style={{ fontSize: 'clamp(3rem, 11vw, 150px)' }}
            >
              Проекты
            </h2>
          </div>
          <p className="max-w-md pb-2 leading-relaxed text-[#D7E2EA]/70 md:text-lg">
            Не мокапы: два продукта команды, которые можно открыть и проверить.
          </p>
        </div>
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
        <div className="relative z-10 flex flex-col items-center gap-6 pt-20 text-center sm:pt-28">
          <p
            className="max-w-xl font-normal leading-relaxed text-[#D7E2EA]/70"
            style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.35rem)' }}
          >
            Есть задача? Покажем релевантные работы и предложим план запуска.
          </p>
          <ContactButton>Написать в Telegram</ContactButton>
        </div>
      </FadeIn>
    </section>
  )
}
