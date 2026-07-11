import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import FadeIn from './FadeIn'

// Секция команды по мотивам ravikatiyar162/team-section-1 (21st.dev),
// адаптация под наш стек и тёмную палитру (без shadcn-токенов).
// Контакты в карточках не показываем — единственный контакт в подвале.

/** 3D-наклон карточки за курсором (только pointer:fine, гасится
    prefers-reduced-motion — слушатель просто не вешается) */
function TiltCard({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 180, damping: 18 })
  const sry = useSpring(ry, { stiffness: 180, damping: 18 })

  const interactive = () =>
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current || !interactive()) return
    const r = ref.current.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 10)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface TeamMember {
  name: string
  designation: string
  imageSrc: string
  imagePosition: string
}

const MEMBERS: TeamMember[] = [
  {
    name: 'Олег Зотов',
    designation: 'Сооснователь · разработка',
    imageSrc: '/team/oleg.jpg',
    imagePosition: '56% 24%',
  },
  {
    name: 'Савелий Спорышев',
    designation: 'Сооснователь · разработка',
    imageSrc: '/team/savely.jpg',
    imagePosition: 'center 32%',
  },
]

export default function TeamSection() {
  return (
    <section
      id="team"
      className="relative w-full overflow-hidden bg-[#0C0C0C] px-5 py-20 sm:px-8 sm:py-24 md:px-10"
    >
      {/* Фоновая сетка */}
      <div className="absolute inset-0 z-0 opacity-5">
        <svg className="h-full w-full" fill="none">
          <defs>
            <pattern
              id="team-grid"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M20 0L0 0 0 20"
                fill="none"
                stroke="#D7E2EA"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#team-grid)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-12 text-center md:gap-16">
        <FadeIn y={40}>
          <h2
            className="hero-heading font-display font-black leading-none tracking-tight"
            style={{ fontSize: 'clamp(2.6rem, 9vw, 110px)' }}
          >
            Команда
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-normal leading-relaxed text-[#D7E2EA]/60 sm:text-lg">
            Ядро студии — мы двое, на связи напрямую. Под задачи проекта
            подключаем свою команду: инженеры, дизайнеры, 3D и моушн.
          </p>
        </FadeIn>

        <div className="grid w-full max-w-5xl grid-cols-1 items-stretch gap-8 md:grid-cols-3 lg:gap-10">
          {MEMBERS.map((member, index) => (
            <FadeIn key={member.name} delay={index * 0.15} y={30} className="h-full">
              <TiltCard className="group relative flex h-full flex-col items-center justify-end overflow-hidden rounded-xl bg-[#141414] p-8 text-center shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-2xl">
                {/* Волна на ховере */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1/2 origin-bottom scale-y-0 transform rounded-t-full bg-gradient-to-t from-[#BBCCD7]/20 to-transparent transition-transform duration-500 ease-out group-hover:scale-y-100"
                  style={{ transitionDelay: `${index * 50}ms` }}
                />

                <div
                  className="relative z-10 h-36 w-36 overflow-hidden rounded-full border-4 border-transparent bg-white/5 transition-all duration-500 ease-out group-hover:scale-105 group-hover:border-[#BBCCD7]"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <img
                    src={member.imageSrc}
                    alt={member.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    style={{ objectPosition: member.imagePosition }}
                  />
                </div>

                <h3 className="relative z-10 mt-5 text-xl font-semibold text-[#D7E2EA]">
                  {member.name}
                </h3>
                <p className="relative z-10 mt-1 text-sm text-[#D7E2EA]/65">
                  {member.designation}
                </p>
              </TiltCard>
            </FadeIn>
          ))}

          {/* Остальная команда — без портретов, счётчиком */}
          <FadeIn delay={0.3} y={30} className="h-full">
            <TiltCard className="group relative flex h-full flex-col items-center justify-end overflow-hidden rounded-xl bg-[#141414] p-8 text-center shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-2xl">
              <div
                className="absolute bottom-0 left-0 right-0 h-1/2 origin-bottom scale-y-0 transform rounded-t-full bg-gradient-to-t from-[#BBCCD7]/20 to-transparent transition-transform duration-500 ease-out group-hover:scale-y-100"
                style={{ transitionDelay: '100ms' }}
              />
              <div className="relative z-10 flex h-36 w-36 items-center justify-center rounded-full border-4 border-transparent bg-white/5 transition-all duration-500 ease-out group-hover:scale-105 group-hover:border-[#FF6A00]">
                <span className="font-display text-4xl font-bold text-[#FF6A00]">
                  +19
                </span>
              </div>
              <h3 className="relative z-10 mt-5 text-xl font-semibold text-[#D7E2EA]">
                И ещё 19 человек
              </h3>
              <p className="relative z-10 mt-1 text-sm text-[#D7E2EA]/65">
                Инженеры, дизайнеры, 3D и моушн — под задачи проекта
              </p>
            </TiltCard>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
