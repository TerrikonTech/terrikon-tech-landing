import { useEffect, useRef, useState } from 'react'

const FRAME_ATLAS = {
  light: '/subject-light-frames.webp',
  dark: '/subject-dark-frames.webp',
}

const SUBJECT_POSTER = {
  light: '/subject-light-poster.webp',
  dark: '/subject-dark-poster.webp',
}

const ATLAS = {
  frames: 40,
  cols: 8,
  rows: 5,
  tileWidth: 960,
  tileHeight: 540,
}

interface SubjectKeyCanvasProps {
  dark: boolean
}

function saveDataEnabled() {
  return Boolean(
    (
      navigator as Navigator & {
        connection?: { saveData?: boolean }
      }
    ).connection?.saveData,
  )
}

export default function SubjectKeyCanvas({ dark }: SubjectKeyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [atlasReady, setAtlasReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches

    // На touch, Save-Data и reduced-motion остаётся лёгкий прозрачный постер.
    // Интерактивный атлас нужен только там, где есть точный указатель.
    if (reduceMotion || coarsePointer || saveDataEnabled()) return

    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return

    let disposed = false
    let visible = true
    let rafId = 0
    let targetFrame = Math.floor((ATLAS.frames - 1) / 2)

    const atlasImage = new Image()
    atlasImage.decoding = 'async'

    const draw = () => {
      rafId = 0
      if (
        disposed ||
        !visible ||
        !atlasImage.complete ||
        !atlasImage.naturalWidth
      ) {
        return
      }

      const clientWidth = canvas.clientWidth
      const clientHeight = canvas.clientHeight
      if (!clientWidth || !clientHeight) return

      // Атлас хранит кадры 960×540: этого достаточно для чёткого hero на
      // desktop, а backing store по-прежнему ограничен исходным разрешением.
      const sourceScale = Math.min(
        ATLAS.tileWidth / clientWidth,
        ATLAS.tileHeight / clientHeight,
      )
      const dpr = Math.max(
        0.5,
        Math.min(window.devicePixelRatio || 1, 1.25, sourceScale * 2.2),
      )
      const width = Math.round(clientWidth * dpr)
      const height = Math.round(clientHeight * dpr)
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, clientWidth, clientHeight)

      const lg = window.matchMedia('(min-width: 1024px)').matches
      const contain = dark && lg && clientWidth / clientHeight >= 16 / 9
      const scale = contain
        ? Math.min(
            clientWidth / ATLAS.tileWidth,
            clientHeight / ATLAS.tileHeight,
          )
        : Math.max(
            clientWidth / ATLAS.tileWidth,
            clientHeight / ATLAS.tileHeight,
          )
      const drawWidth = ATLAS.tileWidth * scale
      const drawHeight = ATLAS.tileHeight * scale
      const alignX = lg ? (dark ? 0.5 : 1) : dark ? 0.5 : 0.68
      const alignY = lg ? 0 : 0.5
      const destinationX = (clientWidth - drawWidth) * alignX
      const destinationY = (clientHeight - drawHeight) * alignY

      const frame = Math.min(
        ATLAS.frames - 1,
        Math.max(0, Math.round(targetFrame)),
      )
      const column = frame % ATLAS.cols
      const row = Math.floor(frame / ATLAS.cols)

      context.drawImage(
        atlasImage,
        column * ATLAS.tileWidth,
        row * ATLAS.tileHeight,
        ATLAS.tileWidth,
        ATLAS.tileHeight,
        destinationX,
        destinationY,
        drawWidth,
        drawHeight,
      )
    }

    const scheduleDraw = () => {
      if (!disposed && !rafId) rafId = requestAnimationFrame(draw)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!visible || event.pointerType !== 'mouse') return
      const denominator = Math.max(window.innerWidth - 1, 1)
      const nextFrame =
        (Math.min(Math.max(event.clientX, 0), denominator) / denominator) *
        (ATLAS.frames - 1)
      if (Math.round(nextFrame) === Math.round(targetFrame)) return
      targetFrame = nextFrame
      scheduleDraw()
    }

    const resizeObserver = new ResizeObserver(scheduleDraw)
    resizeObserver.observe(canvas)

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) scheduleDraw()
      },
      { rootMargin: '120px 0px' },
    )
    visibilityObserver.observe(canvas)

    atlasImage.onload = () => {
      if (disposed) return
      draw()
      setAtlasReady(true)
    }
    atlasImage.src = FRAME_ATLAS[dark ? 'dark' : 'light']

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('resize', scheduleDraw, { passive: true })

    return () => {
      disposed = true
      atlasImage.onload = null
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', scheduleDraw)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [dark])

  const subjectClassName = dark
    ? 'object-center lg:object-center [@media(min-aspect-ratio:16/9)]:lg:object-contain [@media(min-aspect-ratio:16/9)]:lg:object-top'
    : 'object-[68%_50%] lg:object-right-top'

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
    >
      <img
        src={SUBJECT_POSTER[dark ? 'dark' : 'light']}
        alt=""
        fetchPriority="high"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-150 ${subjectClassName} ${
          atlasReady ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <canvas
        ref={canvasRef}
        className={`h-full w-full transition-opacity duration-150 ${
          atlasReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
