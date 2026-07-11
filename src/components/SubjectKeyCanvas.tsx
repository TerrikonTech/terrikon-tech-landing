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
// манекене, тёмные уши ламы) — буквы просвечивали сквозь головы. Фигуры
// крутятся при скрабе, статичные маски не успевают — обе темы используют
// АТЛАС покадровых масок (40 кадров, сетка 8×5, тайл 240×135;
// build_alpha_atlas.py), шейдер берёт кадр по video.currentTime с
// интерполяцией. Тёмная: в атласе готовая альфа (R) + яркость фона (G)
// для вычитания примеси. Светлая: атлас — только нутро фигуры (дыры
// кеинга на бликах лица), кромку режет кеинг.
const MASK_SRC = {
  light: '/subject-mask-light-atlas.png',
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

// Тайл атласа 8x5 (R = альфа, G = яркость локального фона);
// полутексельный отступ, чтобы соседние кадры не затекали
vec2 atlasMask(vec2 uv, float idx) {
  float col = mod(idx, 8.0);
  float row = floor(idx / 8.0);
  vec2 pad = vec2(0.5 / 240.0, 0.5 / 135.0);
  vec2 uvc = clamp(uv, pad, vec2(1.0) - pad);
  return texture2D(uMask, (vec2(col, row) + uvc) / vec2(8.0, 5.0)).rg;
}

void main() {
  vec2 uv = vUV * uScale + uOffset;
  // contain-режим: канвас шире видео, по бокам поля — там прозрачность,
  // иначе CLAMP_TO_EDGE размазал бы крайние пиксели кадра
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0);
    return;
  }
  vec4 c = texture2D(uTex, uv);
  vec3 rgb;
  float a;
  if (uDark > 0.5) {
    // Тёмная тема: в атласе — ГОТОВАЯ покадровая альфа (R) и яркость
    // локального фона (G), difference matting оффлайн (build_alpha_atlas.py).
    // Пиксель кромки = a*ворс + (1-a)*фон: примесь фона вычитаем с его
    // розовым тинтом, иначе на полуальфе остаётся тёмный поясок.
    float f = clamp(uFrame, 0.0, 39.0);
    float i0 = floor(f);
    vec2 t = mix(atlasMask(uv, i0), atlasMask(uv, min(i0 + 1.0, 39.0)), f - i0);
    a = t.r;
    rgb = max(c.rgb - (1.0 - a) * t.g * vec3(1.96, 0.44, 1.36), 0.0);
    // буфер премультиплаенный: вне фигуры rgb обязан быть нулём, иначе
    // фон и свечение аддитивно легли бы на буквы
    rgb *= step(0.004, a);
  } else {
    // Светлая: кеинг даёт точную кромку глянца (и верно срезает светлый
    // rim манекена, сливающийся с фоном), а покадровый атлас закрывает
    // дыры кеинга на бликах лица — статичная маска не успевала за
    // поворотом головы, и буква просвечивала сквозь лицо
    float f = clamp(uFrame, 0.0, 39.0);
    float i0 = floor(f);
    float m = mix(atlasMask(uv, i0).r, atlasMask(uv, min(i0 + 1.0, 39.0)).r,
                  f - i0);
    float d = distance(c.rgb, uKey) / 1.7320508;
    a = max(smoothstep(uThresh.x, uThresh.y, d), m);
    rgb = c.rgb * a;
  }
  gl_FragColor = vec4(rgb, a);
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
      // юнит 1 — маска/атлас; до загрузки — 1×1 чёрный (вклад нулевой).
      // Формат RGB: у атласа тёмной темы два канала (альфа + фон),
      // grayscale-маска светлой раскладывается в r=g=b
      const maskTex = setupTex(1)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB,
        gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0]))
      const maskImg = new Image()
      maskImg.onload = () => {
        if (!cleanupGL) return
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, maskTex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB,
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

      // Повторяем object-fit <video> на lg: cover с якорем right-top;
      // тёмная тема на окнах шире 16/9 — contain по высоте с центровкой
      // (та же логика, что в className видео — иначе вырезка разъедется)
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
        const contain = dark && cw / ch >= 16 / 9
        const s = contain
          ? Math.min(cw / vw, ch / vh)
          : Math.max(cw / vw, ch / vh)
        const dw = vw * s
        const dh = vh * s
        gl.uniform2f(uScale, cw / dw, ch / dh)
        // contain: видео по центру (offset отрицательный — поля по бокам,
        // шейдер гасит uv вне [0,1]); cover: якорь right
        gl.uniform2f(uOffset, contain ? -(cw - dw) / 2 / dw : (dw - cw) / dw, 0)
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
