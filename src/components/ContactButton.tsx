import type { CSSProperties, ReactNode } from 'react'

/** Единственный канал связи студии; используется кнопками CTA и футером */
export const TELEGRAM_URL = 'https://t.me/Zotov_O'

interface ContactButtonProps {
  /** true — кнопка лежит на светлом фоне видео (lg, светлая тема); только для glass */
  onLightBg?: boolean
  /**
   * glass — liquid glass (hero);
   * light — белая плоская кнопка для тёмных секций (дефолт);
   * dark  — чёрная плоская кнопка для белой секции «Услуги»
   */
  variant?: 'glass' | 'light' | 'dark'
  children?: ReactNode
}

const BASE =
  'relative inline-flex origin-center cursor-pointer select-none items-center justify-center rounded-full border-0 px-8 py-3 outline-none transition-[transform,box-shadow] duration-[400ms] ease-[cubic-bezier(0.4,1.5,0.3,1)] hover:scale-[1.03] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF6A00] sm:px-10 sm:py-3.5 md:px-12 md:py-4'

const LINK = {
  href: TELEGRAM_URL,
  target: '_blank',
  rel: 'noopener noreferrer',
} as const

// Плоские кнопки: белая (текст #0C0C0C) на тёмных секциях, чёрная (текст
// белый) на белой секции «Услуги». Hero — liquid glass в духе Apple Tahoe
// (easemize/apple-tahoe-liquid-glass-button, 21st.dev): стеклянный слой на
// backdrop-filter + пакет внутренних теней + световой ободок.
export default function ContactButton({
  onLightBg = false,
  variant = 'light',
  children = 'Связаться',
}: ContactButtonProps) {
  if (variant !== 'glass') {
    const solid =
      variant === 'dark'
        ? 'bg-[#0C0C0C] text-white shadow-[0_6px_20px_-8px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_26px_-8px_rgba(0,0,0,0.6)]'
        : 'bg-white text-[#0C0C0C] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.55)] hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.45)]'
    return (
      <a
        {...LINK}
        className={`${BASE} text-xs font-semibold uppercase tracking-widest sm:text-sm md:text-base ${solid}`}
      >
        {children}
      </a>
    )
  }

  return (
    <a
      {...LINK}
      className={`${BASE} bg-transparent hover:shadow-[0_0_32px_rgba(255,106,0,0.28)]`}
      style={
        {
          '--cos': '0',
          '--sin': '-0.8',
          '--rim-intensity': '0.6',
        } as CSSProperties
      }
    >
      {/* Стеклянный слой: блюр фона + блик + пакет теней из оригинала */}
      <span
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
        style={{
          background: 'color-mix(in srgb, white 25%, transparent)',
          backdropFilter: 'blur(2px) saturate(180%) brightness(1.05)',
          WebkitBackdropFilter: 'blur(2px) saturate(180%) brightness(1.05)',
          backgroundImage:
            'radial-gradient(circle at calc(50% - var(--cos) * 50%) calc(50% - var(--sin) * 50%), rgba(255,255,255,0.2) 0%, transparent 60%)',
          boxShadow: `
            inset 0 0 0 1px color-mix(in srgb, white calc(var(--rim-intensity) * 20%), transparent),
            inset calc(var(--cos) * 1.8px) calc(var(--sin) * 3px) 0px -2px color-mix(in srgb, white calc(var(--rim-intensity) * 90%), transparent),
            inset calc(var(--cos) * -2px) calc(var(--sin) * -2px) 0px -2px color-mix(in srgb, white calc(var(--rim-intensity) * 80%), transparent),
            inset calc(var(--cos) * -3px) calc(var(--sin) * -8px) 1px -6px color-mix(in srgb, white calc(var(--rim-intensity) * 60%), transparent),
            inset calc(var(--cos) * -0.3px) calc(var(--sin) * -1px) 4px 0px color-mix(in srgb, black 12%, transparent),
            inset calc(var(--cos) * -1.5px) calc(var(--sin) * 2.5px) 0px -2px color-mix(in srgb, black 20%, transparent),
            inset calc(var(--cos) * 0px) calc(var(--sin) * 3px) 4px -2px color-mix(in srgb, black 20%, transparent),
            inset calc(var(--cos) * 2px) calc(var(--sin) * -6.5px) 1px -4px color-mix(in srgb, black 10%, transparent),
            calc(var(--cos) * 4px) calc(var(--sin) * 4px) 10px 0px color-mix(in srgb, black 15%, transparent),
            calc(var(--cos) * 9px) calc(var(--sin) * 9px) 18px 0px color-mix(in srgb, black 10%, transparent)
          `,
        }}
      />
      {/* Световой ободок (статичная аппроксимация conic-градиента оригинала) */}
      <span
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] p-[1px]"
        style={{
          background:
            'conic-gradient(from 90deg at 50% 50%, rgba(255,255,255,0.70) 0deg, rgba(255,255,255,0.12) 90deg, rgba(255,255,255,0.45) 180deg, rgba(255,255,255,0.12) 270deg, rgba(255,255,255,0.70) 360deg)',
          WebkitMask:
            'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          maskComposite: 'exclude',
          opacity: 0.8,
        }}
      />
      <span
        className={`pointer-events-none relative z-20 flex items-center justify-center text-xs font-semibold uppercase tracking-widest sm:text-sm md:text-base ${
          onLightBg ? 'text-white/90 lg:text-black/85' : 'text-white/90'
        }`}
      >
        {children}
      </span>
    </a>
  )
}
