import { Send } from 'lucide-react'
import LogoMark from './LogoMark'
import { TELEGRAM_URL } from './ContactButton'

// Футер в духе Nur/ui: колонки ссылок, разделитель, соцлинк + копирайт
// и гигантский контурный водяной знак «ТЕРРИКОН», обрезанный снизу

const NAV_COLUMNS = [
  {
    title: 'О нас',
    links: [
      { label: 'О студии', href: '#about' },
      { label: 'Команда', href: '#team' },
      { label: 'Проекты', href: '#projects' },
    ],
  },
  {
    title: 'Полезные ссылки',
    links: [
      { label: 'Услуги', href: '#price' },
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
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-7 w-8 bg-[#BBCCD7]" />
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              Террикон
            </span>
          </div>
          <p className="mt-4 max-w-[260px] text-sm leading-relaxed text-[#D7E2EA]/50">
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

      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-end py-8">
        <p className="text-xs text-[#D7E2EA]/40 sm:text-sm">
          © 2026 Террикон. Все права защищены.
        </p>
      </div>

      {/* Контурный водяной знак — целиком, без обрезки.
          Размер от вьюпорта: «Террикон» в Unbounded-900 = 6.19em шириной
          (замер Range API) → 15.8vw = ~98% ширины, влезает на любом
          вьюпорте */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative z-0 -mx-6 select-none whitespace-nowrap text-center font-display font-black leading-none tracking-tight sm:-mx-10 md:-mx-16"
        style={{
          fontSize: 'min(15.8vw, 280px)',
          // очертания Unbounded занимают 1.24em при строке 1em (замерено
          // Range API): дескендеры выходят на 0.11em ниже строки, а у футера
          // overflow-hidden — без запаса снизу их срезает краем страницы
          paddingBottom: '0.18em',
          color: 'transparent',
          WebkitTextStroke: '1.5px rgba(187, 204, 215, 0.4)',
        }}
      >
        Террикон
      </div>
    </footer>
  )
}
