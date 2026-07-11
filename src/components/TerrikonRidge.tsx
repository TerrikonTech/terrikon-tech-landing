import { motion } from 'framer-motion'

// Гребень терриконов — горизонт перед футером: контурные силуэты отвалов
// с редкой штриховкой склонов и сигнальным огоньком на мачте главного конуса.
// Появление: контур рисуется штрихом (pathLength), затем зажигается огонёк
// и пульсирует расходящимся кольцом — «передатчик на мачте».
const RIDGES = [
  'M-40 190 L30 132 L58 118 L96 138 L178 190',
  'M150 190 L300 96 L358 44 L418 30 L472 58 L560 104 L700 190',
  'M740 190 L868 108 L948 72 L1002 92 L1092 142 L1188 190',
  'M1160 190 L1266 124 L1318 112 L1382 148 L1440 178',
]

const HATCHES = [
  'M340 70 L390 96',
  'M300 108 L364 140',
  'M448 62 L500 94',
  'M930 92 L980 120',
  'M1290 128 L1330 152',
]

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1 },
}

export default function TerrikonRidge() {
  return (
    <div aria-hidden="true" className="w-full overflow-hidden bg-[#0C0C0C]">
      <motion.svg
        viewBox="0 0 1440 190"
        className="block h-auto w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        <g stroke="#BBCCD7" strokeOpacity="0.3" strokeWidth="1.5">
          {RIDGES.map((d, i) => (
            <motion.path
              key={d}
              d={d}
              variants={draw}
              transition={{ duration: 1.3, delay: i * 0.18, ease: 'easeInOut' }}
            />
          ))}
        </g>
        {/* Штриховка склонов — намёк на слоистость отвала */}
        <g stroke="#BBCCD7" strokeOpacity="0.12" strokeWidth="1">
          {HATCHES.map((d, i) => (
            <motion.path
              key={d}
              d={d}
              variants={draw}
              transition={{ duration: 0.4, delay: 1.1 + i * 0.08 }}
            />
          ))}
        </g>
        {/* Мачта с сигнальным огоньком на вершине главного конуса */}
        <motion.path
          d="M418 30 L418 14"
          stroke="#BBCCD7"
          strokeOpacity="0.4"
          strokeWidth="1.5"
          variants={draw}
          transition={{ duration: 0.3, delay: 1.5 }}
        />
        <motion.circle
          cx="418"
          cy="11"
          r="3.5"
          fill="#FF6A00"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          transition={{ duration: 0.35, delay: 1.8 }}
        />
        {/* Пульс-кольцо от огонька */}
        <motion.circle
          cx="418"
          cy="11"
          r="4"
          fill="none"
          stroke="#FF6A00"
          strokeWidth="1.5"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: [0.7, 0],
              scale: [1, 3.2],
              transition: {
                delay: 2.1,
                duration: 2.4,
                repeat: Infinity,
                repeatDelay: 0.9,
                ease: 'easeOut',
              },
            },
          }}
        />
      </motion.svg>
    </div>
  )
}
