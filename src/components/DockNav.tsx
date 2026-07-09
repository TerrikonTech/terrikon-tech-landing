import { useRef, type ReactNode } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import {
  Home,
  UserRound,
  Tag,
  LayoutGrid,
  Users,
  Send,
  Moon,
  Sun,
} from 'lucide-react'

interface DockNavProps {
  darkTheme: boolean
  onToggleTheme: () => void
}

const LINKS = [
  { icon: Home, label: 'Наверх', href: '#top' },
  { icon: UserRound, label: 'Обо мне', href: '#about' },
  { icon: Tag, label: 'Цены', href: '#price' },
  { icon: LayoutGrid, label: 'Проекты', href: '#projects' },
  { icon: Users, label: 'Команда', href: '#team' },
  { icon: Send, label: 'Контакт', href: '#contact' },
]

const BASE = 40
const PEAK = 64
const RANGE = 120

interface DockItemProps {
  mouseX: MotionValue<number>
  label: string
  onClick: () => void
  children: ReactNode
}

// Иконка дока: чем ближе курсор, тем крупнее кружок и тем ниже он
// опускается — дуга раскрывается вниз (панель прибита к верху экрана)
function DockItem({ mouseX, label, onClick, children }: DockItemProps) {
  const ref = useRef<HTMLButtonElement>(null)

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect()
    if (!bounds) return Infinity
    return val - bounds.x - bounds.width / 2
  })

  const sizeRaw = useTransform(distance, [-RANGE, 0, RANGE], [BASE, PEAK, BASE])
  const yRaw = useTransform(distance, [-RANGE, 0, RANGE], [0, 16, 0])
  const size = useSpring(sizeRaw, { mass: 0.1, stiffness: 200, damping: 14 })
  const y = useSpring(yRaw, { mass: 0.1, stiffness: 200, damping: 14 })

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{ width: size, height: size, y }}
      className="flex shrink-0 items-center justify-center rounded-full bg-white/10 text-[#D7E2EA] transition-colors duration-200 hover:bg-white/20"
    >
      <span className="flex h-[45%] w-[45%] items-center justify-center [&>svg]:h-full [&>svg]:w-full">
        {children}
      </span>
    </motion.button>
  )
}

export default function DockNav({ darkTheme, onToggleTheme }: DockNavProps) {
  const mouseX = useMotionValue(Infinity)

  const scrollTo = (href: string) => {
    if (href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className="fixed left-1/2 top-3 z-50 -translate-x-1/2 sm:top-4"
      aria-label="Основная навигация"
    >
      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex h-14 items-start gap-1.5 rounded-full bg-[#161616]/85 px-2.5 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md sm:gap-2 sm:px-3"
      >
        {LINKS.map((link) => (
          <DockItem
            key={link.href}
            mouseX={mouseX}
            label={link.label}
            onClick={() => scrollTo(link.href)}
          >
            <link.icon strokeWidth={1.8} />
          </DockItem>
        ))}
        <DockItem
          mouseX={mouseX}
          label={darkTheme ? 'Светлая тема' : 'Тёмная тема'}
          onClick={onToggleTheme}
        >
          {darkTheme ? <Sun strokeWidth={1.8} /> : <Moon strokeWidth={1.8} />}
        </DockItem>
      </motion.div>
    </nav>
  )
}
