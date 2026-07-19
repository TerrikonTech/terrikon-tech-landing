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
    // При reduced motion остаётся poster: не создаём WebGL-контекст и не
    // загружаем покадровый атлас маски.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cleanupGL: (() => void) | null = null

    const start = () => {
      if (cleanupGL) return

      // Canvas обновляется только при новом кадре/размере. Постоянная загрузка
      // 1080p-текстуры в GPU на каждом RAF раньше тормозила даже idle-страницу.
      const gl = canvas.getContext('webgl', {
        premultipliedAlpha: true,
        antialias: false,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
      })
      if (!gl || gl.isContextLost()) return

      let disposed = false
      const compile = (type: number, src: string) => {
        const shader = gl.createShader(type)!
        gl.shaderSource(shader, src)
        gl.compileShader(shader)
        return shader
      }
      const vert = compile(gl.VERTEX_SHADER, VERT)
      const frag = compile(gl.FRAGMENT_SHADER, FRAG)
      const prog = gl.createProgram()!
      gl.attachShader(prog, vert)
      gl.attachShader(prog, frag)
      gl.linkProgram(prog)
      gl.deleteShader(vert)
      gl.deleteShader(frag)
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
        const texture = gl.createTexture()
        gl.activeTexture(gl.TEXTURE0 + unit)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        return texture
      }

      // Юнит 1 — атлас масок; до загрузки вклад нулевой.
      const maskTex = setupTex(1)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGB,
        1,
        1,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0]),
      )
      // Юнит 0 — текущий кадр видео.
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

      let rafId = 0
      const draw = () => {
        rafId = 0
        if (disposed || video.readyState < 2 || !video.videoWidth) return
        gl.uniform1f(
          uFrame,
          (video.currentTime / (video.duration || 1)) * (ATLAS.frames - 1),
        )
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, tex)
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
      const scheduleDraw = () => {
        if (!disposed && !rafId) rafId = requestAnimationFrame(draw)
      }

      const maskImg = new Image()
      maskImg.onload = () => {
        if (disposed) return
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, maskTex)
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGB,
          gl.RGB,
          gl.UNSIGNED_BYTE,
          maskImg,
        )
        gl.activeTexture(gl.TEXTURE0)
        scheduleDraw()
      }
      maskImg.src = MASK_SRC[dark ? 'dark' : 'light']

      // Повторяем object-fit <video>. Canvas не рендерится выше исходных
      // 1080p: на HiDPI/4K прежний DPR раздувал каждый GPU upload без пользы.
      const updateCover = () => {
        const cw = canvas.clientWidth
        const ch = canvas.clientHeight
        const vw = video.videoWidth
        const vh = video.videoHeight
        if (!cw || !ch || !vw || !vh) return

        const sourceScale = Math.min(vw / cw, vh / ch)
        const dpr = Math.max(
          0.25,
          Math.min(window.devicePixelRatio || 1, 1.25, sourceScale),
        )
        const width = Math.round(cw * dpr)
        const height = Math.round(ch * dpr)
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width
          canvas.height = height
          gl.viewport(0, 0, width, height)
        }

        const lg = window.matchMedia('(min-width: 1024px)').matches
        const contain = dark && lg && cw / ch >= 16 / 9
        const scale = contain
          ? Math.min(cw / vw, ch / vh)
          : Math.max(cw / vw, ch / vh)
        const dw = vw * scale
        const dh = vh * scale
        const ax = lg ? 1 : dark ? 0.5 : 0.68
        const ay = lg ? 0 : 0.5
        gl.uniform2f(uScale, cw / dw, ch / dh)
        gl.uniform2f(
          uOffset,
          contain ? -(cw - dw) / 2 / dw : ((dw - cw) * ax) / dw,
          ((dh - ch) * ay) / dh,
        )
        scheduleDraw()
      }

      const ro = new ResizeObserver(updateCover)
      ro.observe(canvas)
      video.addEventListener('loadedmetadata', updateCover)
      video.addEventListener('loadeddata', scheduleDraw)
      video.addEventListener('seeked', scheduleDraw)
      video.addEventListener('timeupdate', scheduleDraw)
      updateCover()

      // На touch видео играет: requestVideoFrameCallback даёт ровно один
      // WebGL draw на реально декодированный кадр. На десктопе достаточно
      // события seeked — в покое canvas не потребляет CPU/GPU.
      let videoFrameId: number | null = null
      const onVideoFrame = () => {
        videoFrameId = null
        scheduleDraw()
        if (!video.paused && !video.ended) startVideoFrames()
      }
      const startVideoFrames = () => {
        if (
          videoFrameId === null &&
          'requestVideoFrameCallback' in video &&
          !video.paused
        ) {
          videoFrameId = video.requestVideoFrameCallback(onVideoFrame)
        }
      }
      const stopVideoFrames = () => {
        if (videoFrameId !== null && 'cancelVideoFrameCallback' in video) {
          video.cancelVideoFrameCallback(videoFrameId)
          videoFrameId = null
        }
      }
      video.addEventListener('play', startVideoFrames)
      video.addEventListener('pause', stopVideoFrames)
      startVideoFrames()

      cleanupGL = () => {
        disposed = true
        if (rafId) cancelAnimationFrame(rafId)
        stopVideoFrames()
        ro.disconnect()
        video.removeEventListener('loadedmetadata', updateCover)
        video.removeEventListener('loadeddata', scheduleDraw)
        video.removeEventListener('seeked', scheduleDraw)
        video.removeEventListener('timeupdate', scheduleDraw)
        video.removeEventListener('play', startVideoFrames)
        video.removeEventListener('pause', stopVideoFrames)
        maskImg.onload = null
        gl.deleteProgram(prog)
        gl.deleteTexture(tex)
        gl.deleteTexture(maskTex)
        gl.deleteBuffer(buf)
      }
    }

    // На тач-устройствах poster остаётся первым экраном, а WebGL включается
    // только после пользовательского запуска видео.
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (coarsePointer) {
      video.addEventListener('playing', start, { once: true })
    } else {
      start()
    }
    return () => {
      video.removeEventListener('playing', start)
      cleanupGL?.()
      cleanupGL = null
    }
  }, [videoRef, dark])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2]"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
