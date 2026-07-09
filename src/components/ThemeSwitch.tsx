import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'

interface ThemeSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** true — свитч лежит на светлом фоне видео (lg, светлая тема) */
  onLightBg: boolean
}

// Тумблер в духе shadcn Switch (ShadcnStudio/switch-1), собран руками:
// солнце слева от ползунка, луна справа, без текстового лейбла
export default function ThemeSwitch({
  checked,
  onChange,
  onLightBg,
}: ThemeSwitchProps) {
  const iconBase =
    'h-3.5 w-3.5 transition-opacity duration-200 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#D7E2EA]'
  const darkOnLg = onLightBg ? 'lg:text-[#0C0C0C]' : ''

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Переключить тёмную тему"
      onClick={() => onChange(!checked)}
      className="flex shrink-0 items-center gap-1.5 sm:gap-2"
    >
      <Sun
        strokeWidth={2}
        className={`${iconBase} ${darkOnLg} ${checked ? 'opacity-40' : 'opacity-100'}`}
      />
      <span
        className={`flex h-4 w-7 items-center rounded-full p-0.5 transition-colors duration-200 sm:h-5 sm:w-9 ${
          checked
            ? 'justify-end bg-[#B600A8]'
            : `justify-start bg-[#D7E2EA]/30 ${onLightBg ? 'lg:bg-[#0C0C0C]/25' : ''}`
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="h-3 w-3 rounded-full bg-white shadow-sm sm:h-4 sm:w-4"
        />
      </span>
      <Moon
        strokeWidth={2}
        className={`${iconBase} ${darkOnLg} ${checked ? 'opacity-100' : 'opacity-40'}`}
      />
    </button>
  )
}
