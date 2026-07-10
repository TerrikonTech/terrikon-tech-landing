import { useEffect, useRef, type RefObject } from 'react'

// Рантайм-вырезка субъекта из скраб-видео: WebGL-канвас лежит ПОВЕРХ
// заголовка (z-2 > z-1) и каждый кадр рисует видео с альфой по расстоянию
// цвета от ровного студийного фона — фон прозрачен, фигура перекрывает
// буквы. Сам <video> остаётся нижним слоем (z-0), так что «дыры» кеинга
// (белые блики) проваливаются в тот же кадр и не видны вне текста.
// Только lg: ниже видео не пересекается с заголовком. Нет WebGL — канвас
// остаётся прозрачным, страница выглядит как без эффекта.

// Ключ-цвета замерены по кадрам роликов (фон у обоих практически ровный)
const KEY_LIGHT = { key: [0.945, 0.941, 0.976], thresh: [0.05, 0.14] }
const KEY_DARK = { key: [0.01, 0.01, 0.024], thresh: [0.03, 0.085] }

// Кеинг по цвету дырявит фигуру там, где она совпадает с фоном (блики на
// манекене, тёмные уши ламы) — буквы просвечивали сквозь головы.
// Светлая тема: статичная маска-страховка от дыр (кеинг даёт точную кромку).
// Тёмная: лама крутит головой при скрабе, статичная маска либо режет уши,
// либо грызёт буквы — поэтому АТЛАС покадровых масок (40 кадров, сетка 8×5,
// тайл 240×135; build_atlas.py), шейдер берёт маску текущего кадра по
// video.currentTime с интерполяцией между соседними.
const MASK_SRC = {
  light: '/subject-mask-light.png',
  dark: '/subject-mask-dark-atlas.png',
}
const ATLAS = { frames: 40, cols: 8, rows: 5 }

const VERT = `
attribute vec2 aPos;
varying vec2 vUV;
void main() {
  vUV = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
precision mediump float;
varying vec2 vUV;
uniform sampler2D uTex;
uniform sampler2D uMask;
uniform vec2 uScale;
uniform vec2 uOffset;
uniform vec3 uKey;
uniform vec2 uThresh;
uniform float uDark;
uniform float uFrame;

// Тайл атласа 8x5: полутексельный отступ, чтобы соседние кадры не затекали
float atlasMask(vec2 uv, float idx) {
  float col = mod(idx, 8.0);
  float row = floor(idx / 8.0);
  vec2 pad = vec2(0.5 / 240.0, 0.5 / 135.0);
  vec2 uvc = clamp(uv, pad, vec2(1.0) - pad);
  return texture2D(uMask, (vec2(col, row) + uvc) / vec2(8.0, 5.0)).r;
}

void main() {
  vec2 uv = vUV * uScale + uOffset;
  vec4 c = texture2D(uTex, uv);
  float a;
  if (uDark > 0.5) {
    // Тёмная тема: кеинг тёмного ворса по тёмному фону даёт грязь, а
    // статичная маска не успевает за поворотом головы — берём покадровую
    // маску из атласа по текущему времени видео, соседние кадры смешиваем
    float f = clamp(uFrame, 0.0, 39.0);
    float i0 = floor(f);
    float m = mix(atlasMask(uv, i0), atlasMask(uv, min(i0 + 1.0, 39.0)), f - i0);
    // Внутри фигуры — сплошняк; в тонком поясе кромки альфа по яркости:
    // шерстинки светлые — непрозрачны, чёрный фон между/за ними — нет.
    // Иначе растушёванный край маски рисует чёрную обводку поверх букв.
    float luma = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    a = max(smoothstep(0.62, 0.85, m),
            smoothstep(0.18, 0.45, m) * smoothstep(0.1, 0.26, luma));
  } else {
    // Светлая: кеинг даёт точную кромку глянца, маска страхует от дыр
    float d = distance(c.rgb, uKey) / 1.7320508;
    a = max(smoothstep(uThresh.x, uThresh.y, d), texture2D(uMask, uv).r);
  }
  gl_FragColor = vec4(c.rgb * a, a);
}`

interface SubjectKeyCanvasProps {
  videoRef: RefObject<HTMLVideoElement>
  dark: boolean
}

export default function SubjectKeyCanvas({
  videoRef,
  dark,
}: SubjectKeyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const mq = window.matchMedia('(min-width: 1024px)')
    let cleanupGL: (() => void) | null = null

    const start = () => {
      if (cleanupGL) return
      // preserveDrawingBuffer — чтобы кадр можно было прочитать/отладить.
      // Контекст один на канвас (повторный getContext вернёт его же), поэтому
      // в cleanup НЕ вызываем loseContext — StrictMode перемонтирует эффект,
      // и второй заход получил бы мёртвый контекст.
      const gl = canvas.getContext('webgl', {
        premultipliedAlpha: true,
        preserveDrawingBuffer: true,
      })
      if (!gl || gl.isContextLost()) return

      const compile = (type: number, src: string) => {
        const s = gl.createShader(type)!
        gl.shaderSource(s, src)
        gl.compileShader(s)
        return s
      }
      const prog = gl.createProgram()!
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
      gl.linkProgram(prog)
      gl.useProgram(prog)

      // Один треугольник на весь экран
      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      )
      const aPos = gl.getAttribLocation(prog, 'aPos')
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

      const setupTex = (unit: number) => {
        const t = gl.createTexture()
        gl.activeTexture(gl.TEXTURE0 + unit)
        gl.bindTexture(gl.TEXTURE_2D, t)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        return t
      }
      // юнит 1 — маска силуэта; до загрузки — 1×1 чёрный (вклад нулевой)
      const maskTex = setupTex(1)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 1, 1, 0, gl.LUMINANCE,
        gl.UNSIGNED_BYTE, new Uint8Array([0]))
      const maskImg = new Image()
      maskImg.onload = () => {
        if (!cleanupGL) return
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, maskTex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE,
          gl.UNSIGNED_BYTE, maskImg)
        // вернуть активный юнит: tick заливает кадры видео в юнит 0
        gl.activeTexture(gl.TEXTURE0)
      }
      maskImg.src = MASK_SRC[dark ? 'dark' : 'light']
      // юнит 0 — кадр видео (активным остаётся он: tick заливает сюда)
      const tex = setupTex(0)

      const { key, thresh } = dark ? KEY_DARK : KEY_LIGHT
      gl.uniform1i(gl.getUniformLocation(prog, 'uTex'), 0)
      gl.uniform1i(gl.getUniformLocation(prog, 'uMask'), 1)
      gl.uniform1f(gl.getUniformLocation(prog, 'uDark'), dark ? 1 : 0)
      gl.uniform3fv(gl.getUniformLocation(prog, 'uKey'), key)
      gl.uniform2fv(gl.getUniformLocation(prog, 'uThresh'), thresh)
      const uScale = gl.getUniformLocation(prog, 'uScale')
      const uOffset = gl.getUniformLocation(prog, 'uOffset')
      const uFrame = gl.getUniformLocation(prog, 'uFrame')

      // Повторяем object-fit: cover с якорем right-bottom, как у <video> на lg
      const updateCover = () => {
        const cw = canvas.clientWidth
        const ch = canvas.clientHeight
        const vw = video.videoWidth
        const vh = video.videoHeight
        if (!cw || !ch || !vw || !vh) return
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
        canvas.width = Math.round(cw * dpr)
        canvas.height = Math.round(ch * dpr)
        gl.viewport(0, 0, canvas.width, canvas.height)
        const s = Math.max(cw / vw, ch / vh)
        const dw = vw * s
        const dh = vh * s
        gl.uniform2f(uScale, cw / dw, ch / dh)
        gl.uniform2f(uOffset, (dw - cw) / dw, (dh - ch) / dh)
      }
      const ro = new ResizeObserver(updateCover)
      ro.observe(canvas)
      video.addEventListener('loadedmetadata', updateCover)
      updateCover()

      let rafId = 0
      const tick = () => {
        rafId = requestAnimationFrame(tick)
        if (video.readyState < 2 || !video.videoWidth) return
        // позиция кадра в атласе масок (тёмная тема)
        gl.uniform1f(
          uFrame,
          (video.currentTime / (video.duration || 1)) * (ATLAS.frames - 1),
        )
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          video,
        )
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      }
      rafId = requestAnimationFrame(tick)

      cleanupGL = () => {
        cancelAnimationFrame(rafId)
        ro.disconnect()
        video.removeEventListener('loadedmetadata', updateCover)
        maskImg.onload = null
        gl.deleteProgram(prog)
        gl.deleteTexture(tex)
        gl.deleteTexture(maskTex)
        gl.deleteBuffer(buf)
      }
    }

    const stop = () => {
      cleanupGL?.()
      cleanupGL = null
    }
    const onChange = () => (mq.matches ? start() : stop())
    onChange()
    mq.addEventListener('change', onChange)
    return () => {
      mq.removeEventListener('change', onChange)
      stop()
    }
  }, [videoRef, dark])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2] hidden lg:block"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
