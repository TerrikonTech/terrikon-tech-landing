import { useRef, type CSSProperties } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'

interface AnimatedTextProps {
  text: string
  className?: string
  style?: CSSProperties
}

interface CharProps {
  char: string
  progress: MotionValue<number>
  range: [number, number]
}

function Char({ char, progress, range }: CharProps) {
  const opacity = useTransform(progress, range, [0.2, 1])
  return (
    <span className="relative">
      <span className="opacity-0">{char}</span>
      <motion.span
        aria-hidden="true"
        className="absolute left-0"
        style={{ opacity }}
      >
        {char}
      </motion.span>
    </span>
  )
}

export default function AnimatedText({
  text,
  className,
  style,
}: AnimatedTextProps) {
  const targetRef = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start 0.8', 'end 0.2'],
  })

  const words = text.split(' ')
  const totalChars = text.length
  let charIndex = 0

  return (
    <p ref={targetRef} className={className} style={style}>
      {words.map((word, wordIdx) => {
        const chars = word.split('').map((char) => {
          const start = charIndex / totalChars
          const end = (charIndex + 1) / totalChars
          charIndex += 1
          return (
            <Char
              key={charIndex}
              char={char}
              progress={scrollYProgress}
              range={[start, end]}
            />
          )
        })
        charIndex += 1 // account for the space after the word
        return (
          <span key={wordIdx} className="inline-block whitespace-nowrap">
            {chars}
            {wordIdx < words.length - 1 && <span>&nbsp;</span>}
          </span>
        )
      })}
    </p>
  )
}
