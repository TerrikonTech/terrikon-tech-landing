import FadeIn from './FadeIn'
import AnimatedText from './AnimatedText'
import ContactButton from './ContactButton'
import { GlyphApp, GlyphCube, GlyphMotion, GlyphSite } from './AboutGlyphs'

const ABOUT_TEXT =
  'Мы — Террикон, студия разработки из Донецка. Никаких менеджеров-прослоек: вы говорите напрямую с теми, кто пишет код. Двое инженеров ведут проект от макета до сервера — сайты, приложения, 3D и моушн.'

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative flex min-h-screen flex-col items-center justify-center px-5 py-20 sm:px-8 md:px-10"
    >
      {/* Угловые глифы в графическом языке сайта (контур+штрих+огонёк,
          как TerrikonRidge) — кодируют содержание текста: сайты,
          приложения, 3D, моушн. Раньше тут были случайные хотлинк-иконки
          с чужого figma.site */}
      <FadeIn
        delay={0.1}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute left-[1%] top-[4%] w-[120px] sm:left-[2%] sm:w-[160px] md:left-[4%] md:w-[210px]"
      >
        <GlyphSite className="h-auto w-full" />
      </FadeIn>
      <FadeIn
        delay={0.25}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] left-[3%] w-[100px] sm:left-[6%] sm:w-[140px] md:left-[10%] md:w-[180px]"
      >
        <GlyphApp className="h-auto w-full" />
      </FadeIn>
      <FadeIn
        delay={0.15}
        x={80}
        y={0}
        duration={0.9}
        className="absolute right-[1%] top-[4%] w-[120px] sm:right-[2%] sm:w-[160px] md:right-[4%] md:w-[210px]"
      >
        <GlyphCube className="h-auto w-full" />
      </FadeIn>
      <FadeIn
        delay={0.3}
        x={80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] right-[3%] w-[130px] sm:right-[6%] sm:w-[170px] md:right-[10%] md:w-[220px]"
      >
        <GlyphMotion className="h-auto w-full" />
      </FadeIn>

      <div className="flex flex-col items-center gap-16 sm:gap-20 md:gap-24">
        <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
          <FadeIn delay={0} y={40}>
            <h2
              className="hero-heading text-center font-display font-black leading-none tracking-tight"
              style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
            >
              О нас
            </h2>
          </FadeIn>
          <AnimatedText
            text={ABOUT_TEXT}
            className="max-w-[560px] text-center font-medium leading-relaxed text-[#D7E2EA]"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
          />
        </div>
        <FadeIn>
          <ContactButton />
        </FadeIn>
      </div>
    </section>
  )
}
