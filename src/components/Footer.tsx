import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import LogoMark from './LogoMark'
import { TELEGRAM_URL } from './ContactButton'

// Футер в духе Nur/ui: колонки ссылок, разделитель, соцлинк + копирайт
// и гигантский контурный водяной знак «ТЕРРИКОН», обрезанный снизу

// Одна колонка «Меню»: «Полезные ссылки» с «Наверх» внутри — рыбный
// заголовок, навигация по сайту и есть меню
const NAV_COLUMNS = [
  {
    title: 'Меню',
    links: [
      { label: 'О студии', href: '#about' },
      { label: 'Услуги', href: '#services' },
      { label: 'Проекты', href: '#projects' },
      { label: 'Команда', href: '#team' },
      { label: 'Наверх', href: '#top' },
    ],
  },
]

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden bg-[#0C0C0C] px-6 pt-20 sm:px-10 md:px-16"
    >
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Лого + описание */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-7 w-8 bg-[#BBCCD7]" />
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              Террикон
            </span>
          </div>
          <p className="mt-4 max-w-[260px] text-sm leading-relaxed text-[#D7E2EA]/65">
            Террикон — студия из Донецка: сайты, приложения и 3D, которые
            запоминаются.
          </p>
        </div>

        {NAV_COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-base font-semibold text-white">{col.title}</h3>
            <ul className="mt-5 flex flex-col gap-3.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[#D7E2EA]/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Контакты — единственное целевое действие, поэтому кнопка, не строчка */}
        <div>
          <h3 className="text-base font-semibold text-white">Контакты</h3>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-[#FF6A00] px-6 py-3 text-sm font-semibold text-[#0C0C0C] transition-transform hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF6A00] active:scale-[0.97]"
          >
            <Send className="h-4 w-4" />
            Написать в Telegram
          </a>
          <p className="mt-3 text-sm leading-relaxed text-[#D7E2EA]/60">
            Олег, сооснователь.
            <br />
            Отвечаем в течение дня.
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-16 max-w-6xl border-t border-white/10" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 py-8">
        <a
          href="/privacy.html"
          className="text-xs text-[#D7E2EA]/60 transition-colors hover:text-white sm:text-sm"
        >
          Политика обработки персональных данных
        </a>
        <p className="text-xs text-[#D7E2EA]/60 sm:text-sm">
          © 2026 Террикон. Все права защищены.
        </p>
      </div>

      {/* Водяной знак — призрачная заливка с растворением вниз (слово-
          монумент тает в фон; контурная обводка забракована). Размер от
          вьюпорта: «Террикон» в Unbounded-900 = 6.19em шириной (замер
          Range API) → 15.8vw = ~98% ширины на любой ширине. Вырастает
          из-под нижней кромки, как растёт отвал (overflow-hidden футера
          делает выезд бесшовным) */}
      <motion.div
        aria-hidden="true"
        initial={{ y: '55%' }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ type: 'spring', stiffness: 50, damping: 16, mass: 1.1 }}
        className="pointer-events-none relative z-0 -mx-6 select-none whitespace-nowrap text-center font-display font-black leading-none tracking-tight sm:-mx-10 md:-mx-16"
        style={{
          fontSize: 'min(15.8vw, 280px)',
          // очертания Unbounded занимают 1.24em при строке 1em (замерено
          // Range API): дескендеры выходят на 0.11em ниже строки, а у футера
          // overflow-hidden — без запаса снизу их срезает краем страницы
          paddingBottom: '0.18em',
          backgroundImage:
            'linear-gradient(180deg, rgba(187,204,215,0.20) 0%, rgba(187,204,215,0.03) 85%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        Террикон
      </motion.div>
    </footer>
  )
}
