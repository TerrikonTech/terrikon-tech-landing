import { Fragment, useEffect, useRef, useState } from 'react'

const SCENE_FRAME_ATLAS = {
  light: '/scene-light-frames.webp',
  dark: '/scene-dark-frames.webp',
}

const SCENE_POSTER = {
  light: '/scene-light-poster.webp',
  dark: '/scene-dark-poster.webp',
}

const SUBJECT_FRAME_ATLAS = {
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
  const sceneCanvasRef = useRef<HTMLCanvasElement>(null)
  const subjectCanvasRef = useRef<HTMLCanvasElement>(null)
  const [atlasesReady, setAtlasesReady] = useState(false)

  useEffect(() => {
    const sceneCanvas = sceneCanvasRef.current
    const subjectCanvas = subjectCanvasRef.current
    if (!sceneCanvas || !subjectCanvas) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches

    // На touch, Save-Data и reduced-motion остаётся синхронная пара постеров:
    // полный кадр под текстом и прозрачная фигура поверх него.
    if (reduceMotion || coarsePointer || saveDataEnabled()) return

    const sceneContext = sceneCanvas.getContext('2d', { alpha: true })
    const subjectContext = subjectCanvas.getContext('2d', { alpha: true })
    if (!sceneContext || !subjectContext) return

    let disposed = false
    let visible = true
    let rafId = 0
    let targetFrame = Math.floor((ATLAS.frames - 1) / 2)

    const sceneAtlas = new Image()
    const subjectAtlas = new Image()
    sceneAtlas.decoding = 'async'
    subjectAtlas.decoding = 'async'

    const draw = () => {
      rafId = 0
      if (
        disposed ||
        !visible ||
        !sceneAtlas.complete ||
        !sceneAtlas.naturalWidth ||
        !subjectAtlas.complete ||
        !subjectAtlas.naturalWidth
      ) {
        return
      }

      const clientWidth = subjectCanvas.clientWidth
      const clientHeight = subjectCanvas.clientHeight
      if (!clientWidth || !clientHeight) return

      // Атласы хранят синхронные кадры 960×540. Backing store ограничен
      // исходной детализацией, чтобы 4K/HiDPI не раздувал canvas без пользы.
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
      for (const canvas of [sceneCanvas, subjectCanvas]) {
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width
          canvas.height = height
        }
      }

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
      const sourceX = column * ATLAS.tileWidth
      const sourceY = row * ATLAS.tileHeight

      for (const context of [sceneContext, subjectContext]) {
        context.setTransform(dpr, 0, 0, dpr, 0, 0)
        context.clearRect(0, 0, clientWidth, clientHeight)
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'high'
      }
      sceneContext.drawImage(
        sceneAtlas,
        sourceX,
        sourceY,
        ATLAS.tileWidth,
        ATLAS.tileHeight,
        destinationX,
        destinationY,
        drawWidth,
        drawHeight,
      )
      subjectContext.drawImage(
        subjectAtlas,
        sourceX,
        sourceY,
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
    resizeObserver.observe(subjectCanvas)

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) scheduleDraw()
      },
      { rootMargin: '120px 0px' },
    )
    visibilityObserver.observe(subjectCanvas)

    const onAtlasLoad = () => {
      if (
        disposed ||
        !sceneAtlas.complete ||
        !sceneAtlas.naturalWidth ||
        !subjectAtlas.complete ||
        !subjectAtlas.naturalWidth
      ) {
        return
      }
      draw()
      setAtlasesReady(true)
    }
    sceneAtlas.onload = onAtlasLoad
    subjectAtlas.onload = onAtlasLoad
    sceneAtlas.src = SCENE_FRAME_ATLAS[dark ? 'dark' : 'light']
    subjectAtlas.src = SUBJECT_FRAME_ATLAS[dark ? 'dark' : 'light']

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('resize', scheduleDraw, { passive: true })

    return () => {
      disposed = true
      sceneAtlas.onload = null
      subjectAtlas.onload = null
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', scheduleDraw)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [dark])

  const frameClassName = dark
    ? 'object-center lg:object-center [@media(min-aspect-ratio:16/9)]:lg:object-contain [@media(min-aspect-ratio:16/9)]:lg:object-top'
    : 'object-[68%_50%] lg:object-right-top'
  const readyClassName = atlasesReady ? 'opacity-100' : 'opacity-0'
  const posterClassName = atlasesReady ? 'opacity-0' : 'opacity-100'

  return (
    <Fragment>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <img
          src={SCENE_POSTER[dark ? 'dark' : 'light']}
          alt=""
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-150 ${frameClassName} ${posterClassName}`}
        />
        <canvas
          ref={sceneCanvasRef}
          className={`h-full w-full transition-opacity duration-150 ${readyClassName}`}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
      >
        <img
          src={SUBJECT_POSTER[dark ? 'dark' : 'light']}
          alt=""
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-150 ${frameClassName} ${posterClassName}`}
        />
        <canvas
          ref={subjectCanvasRef}
          className={`h-full w-full transition-opacity duration-150 ${readyClassName}`}
        />
      </div>
    </Fragment>
  )
}
