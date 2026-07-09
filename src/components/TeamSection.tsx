import type { ElementType } from 'react'
import { Send, Instagram } from 'lucide-react'
import FadeIn from './FadeIn'

// Секция команды по мотивам ravikatiyar162/team-section-1 (21st.dev),
// адаптация под наш стек и тёмную палитру (без shadcn-токенов)

interface SocialLink {
  icon: ElementType
  href: string
  label: string
}

interface TeamMember {
  name: string
  designation: string
  imageSrc: string
  imagePosition: string
  socialLinks?: SocialLink[]
}

const MEMBERS: TeamMember[] = [
  {
    name: 'Олег Зотов',
    designation: 'Сооснователь · разработка',
    imageSrc: '/team/oleg.jpg',
    imagePosition: '56% 24%',
    socialLinks: [
      { icon: Send, href: 'https://t.me/Zotov_O', label: 'Телеграм Олега' },
      {
        icon: Instagram,
        href: 'https://www.instagram.com/zotov.onair',
        label: 'Инстаграм Олега',
      },
    ],
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
          <span className="mb-4 block text-sm font-medium uppercase tracking-[0.35em] text-[#B600A8] sm:text-base">
            Наша
          </span>
          <h2
            className="hero-heading font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(3rem, 10vw, 120px)' }}
          >
            Команда
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-light leading-relaxed text-[#D7E2EA]/60 sm:text-lg">
            Мы сами пишем свои проекты — двое разработчиков из Донецка, чтобы
            каждая идея доезжала до продакшена.
          </p>
        </FadeIn>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {MEMBERS.map((member, index) => (
            <FadeIn key={member.name} delay={index * 0.15} y={30}>
              <div className="group relative flex flex-col items-center justify-end overflow-hidden rounded-xl bg-[#141414] p-8 text-center shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl">
                {/* Волна на ховере */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1/2 origin-bottom scale-y-0 transform rounded-t-full bg-gradient-to-t from-[#B600A8]/25 to-transparent transition-transform duration-500 ease-out group-hover:scale-y-100"
                  style={{ transitionDelay: `${index * 50}ms` }}
                />

                <div
                  className="relative z-10 h-36 w-36 overflow-hidden rounded-full border-4 border-transparent bg-white/5 transition-all duration-500 ease-out group-hover:scale-105 group-hover:border-[#B600A8]"
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
                <p className="relative z-10 mt-1 text-sm text-[#D7E2EA]/50">
                  {member.designation}
                </p>

                {member.socialLinks && member.socialLinks.length > 0 && (
                  <div className="relative z-10 mt-4 flex gap-3 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
                    {member.socialLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label}
                        className="text-[#D7E2EA]/60 transition-colors hover:text-[#B600A8]"
                      >
                        <link.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
