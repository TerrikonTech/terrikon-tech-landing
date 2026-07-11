import { motion } from 'framer-motion'

// Свой графический язык сайта (см. DESIGN.md): контурные силуэты со
// штриховкой и сигнальным огоньком #FF6A00 — как TerrikonRidge.
// Четыре глифа кодируют то, о чём текст «О нас»: сайты, приложения,
// 3D и моушн. Заменяют случайные хотлинк-иконки с чужого figma.site.

const STROKE = { stroke: '#BBCCD7', strokeOpacity: 0.3, strokeWidth: 2, fill: 'none' }
const HATCH = { stroke: '#BBCCD7', strokeOpacity: 0.12, strokeWidth: 1.5 }
const DOT = '#FF6A00'

/** Сигнальный огонёк с расходящимся пульс-кольцом; delay разводит глифы,
    чтобы огоньки перемигивались по очереди */
function SignalDot({ cx, cy, delay = 0 }: { cx: number; cy: number; delay?: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="3.5" fill={DOT} />
      <motion.circle
        cx={cx}
        cy={cy}
        r="4"
        fill="none"
        stroke={DOT}
        strokeWidth="1.5"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.6, 0], scale: [1, 2.8] }}
        transition={{
          delay,
          duration: 2.2,
          repeat: Infinity,
          repeatDelay: 2.6,
          ease: 'easeOut',
        }}
      />
    </>
  )
}

/** Сайты: окно браузера, курсор с огоньком */
export function GlyphSite({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <g {...STROKE}>
        <rect x="12" y="22" width="96" height="76" rx="8" />
        <path d="M12 42 L108 42" />
        <circle cx="24" cy="32" r="2.5" />
        <circle cx="34" cy="32" r="2.5" />
        <path d="M64 62 L84 82 L74 82 L79 92 L73 95 L68 85 L61 92 Z" />
      </g>
      <g {...HATCH}>
        <path d="M22 54 L46 54" />
        <path d="M22 64 L52 64" />
        <path d="M22 74 L40 74" />
      </g>
      <SignalDot cx={84} cy={82} delay={0} />
    </svg>
  )
}

/** Приложения: смартфон с уведомлением */
export function GlyphApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <g {...STROKE}>
        <rect x="38" y="12" width="44" height="96" rx="10" />
        <path d="M52 100 L68 100" />
        <rect x="46" y="30" width="28" height="18" rx="4" />
      </g>
      <g {...HATCH}>
        <path d="M46 58 L74 58" />
        <path d="M46 66 L66 66" />
        <path d="M46 74 L70 74" />
      </g>
      <SignalDot cx={82} cy={16} delay={1.2} />
    </svg>
  )
}

/** 3D: изометрический куб со штриховкой грани */
export function GlyphCube({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <g {...STROKE}>
        <path d="M60 14 L100 36 L100 82 L60 104 L20 82 L20 36 Z" />
        <path d="M20 36 L60 58 L100 36" />
        <path d="M60 58 L60 104" />
      </g>
      <g {...HATCH}>
        <path d="M28 48 L44 57" />
        <path d="M28 60 L52 73" />
        <path d="M28 72 L44 81" />
      </g>
      <SignalDot cx={60} cy={14} delay={2.4} />
    </svg>
  )
}

/** Моушн: траектория с кадрами-штрихами и точкой в конце */
export function GlyphMotion({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <g {...STROKE}>
        <path d="M16 92 C 34 92, 34 46, 60 46 C 86 46, 86 72, 100 34" strokeDasharray="10 7" />
        <path d="M92 40 L100 34 L101 44" />
      </g>
      <g {...HATCH}>
        <path d="M20 100 L34 100" />
        <path d="M40 100 L48 100" />
        <path d="M54 100 L58 100" />
      </g>
      <SignalDot cx={100} cy={34} delay={3.6} />
    </svg>
  )
}
