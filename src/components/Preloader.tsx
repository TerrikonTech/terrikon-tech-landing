import { useEffect, useState } from 'react'
import TetrisLoading from './TetrisLoading'

// Полноэкранный прелоадер: висит минимум 1.6с и до полной загрузки
// страницы, затем плавно растворяется
export default function Preloader() {
  const [phase, setPhase] = useState<'shown' | 'fading' | 'gone'>('shown')

  useEffect(() => {
    const minDelay = new Promise((r) => setTimeout(r, 1600))
    const loaded =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener('load', r, { once: true }))

    let fadeTimer: ReturnType<typeof setTimeout>
    Promise.all([minDelay, loaded]).then(() => {
      setPhase('fading')
      fadeTimer = setTimeout(() => setPhase('gone'), 500)
    })
    return () => clearTimeout(fadeTimer)
  }, [])

  if (phase === 'gone') return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0C0C0C] transition-opacity duration-500 ${
        phase === 'fading' ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-hidden={phase === 'fading'}
    >
      <TetrisLoading size="md" speed="normal" showLoadingText={false} />
    </div>
  )
}
