import type { CSSProperties, ReactNode } from 'react'

/** Единственный канал связи студии; используется кнопками CTA и футером */
export const TELEGRAM_URL = 'https://t.me/Zotov_O'

interface ContactButtonProps {
  /** true — кнопка лежит на светлом фоне видео (lg, светлая тема) */
  onLightBg?: boolean
  /** dark — сплошная тёмная пилюля для белых секций: стекло на белом не читается */
  variant?: 'glass' | 'dark'
  children?: ReactNode
}

const SHARED =
  'relative inline-flex origin-center cursor-pointer select-none items-center justify-center rounded-full px-8 py-3 outline-none transition-transform duration-[400ms] ease-[cubic-bezier(0.4,1.5,0.3,1)] hover:scale-[1.03] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF6A00] sm:px-10 sm:py-3.5 md:px-12 md:py-4'

// Кнопка в духе Apple Tahoe liquid glass (easemize/apple-tahoe-liquid-glass-button,
// 21st.dev). Портирован standalone-режим (svg-mode): стеклянный слой на
// backdrop-filter + пакет внутренних теней + световой ободок. Динамический
// анализ преломления из LiquidGlassViewport не переносим — он работает только
// поверх статичной картинки, а у нас фон hero — живое видео.
export default function ContactButton({
  onLightBg = false,
  variant = 'glass',
  children = 'Связаться',
}: ContactButtonProps) {
  if (variant === 'dark') {
    return (
      <a
        href={TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${SHARED} bg-[#0C0C0C] text-xs font-semibold uppercase tracking-widest text-white/95 sm:text-sm md:text-base`}
      >
        {children}
      </a>
    )
  }

  return (
    <a
      href={TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${SHARED} border-0 bg-transparent`}
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
