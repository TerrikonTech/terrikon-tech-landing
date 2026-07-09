import { motion } from 'framer-motion'
import { Moon } from 'lucide-react'

interface ThemeSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** true — свитч лежит на светлом фоне видео (lg, светлая тема) */
  onLightBg: boolean
}

// Тумблер в духе shadcn Switch + Label (ShadcnStudio/switch-1),
// собран руками: в проекте нет radix/shadcn-инфраструктуры
export default function ThemeSwitch({
  checked,
  onChange,
  onLightBg,
}: ThemeSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Toggle dark theme"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2"
    >
      <span
        className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors duration-200 ${
          checked
            ? 'justify-end bg-[#B600A8]'
            : `justify-start bg-[#D7E2EA]/30 ${onLightBg ? 'lg:bg-[#0C0C0C]/25' : ''}`
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="h-4 w-4 rounded-full bg-white shadow-sm"
        />
      </span>
      <span
        className={`flex items-center gap-1 text-sm font-medium uppercase tracking-wider text-[#D7E2EA] md:text-lg lg:text-[1.4rem] ${
          onLightBg && !checked ? 'lg:text-[#0C0C0C]' : ''
        }`}
      >
        <Moon className="h-[1em] w-[1em]" strokeWidth={2} />
        Dark
      </span>
    </button>
  )
}
