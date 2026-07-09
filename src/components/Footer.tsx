import { Mountain, Send } from 'lucide-react'

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
            <Mountain className="h-7 w-7 text-[#BBCCD7]" strokeWidth={2.2} />
            <span className="text-2xl font-bold tracking-tight text-white">
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

        {/* Контакты — только Телеграм */}
        <div>
          <h3 className="text-base font-semibold text-white">Контакты</h3>
          <ul className="mt-5">
            <li>
              <a
                href="https://t.me/Zotov_O"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-[#D7E2EA]/60 transition-colors hover:text-white"
              >
                <Send className="h-4 w-4 text-[#BBCCD7]" />
                Телеграм
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-16 max-w-6xl border-t border-white/10" />

      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-end py-8">
        <p className="text-xs text-[#D7E2EA]/40 sm:text-sm">
          © 2026 Террикон. Все права защищены.
        </p>
      </div>

      {/* Контурный водяной знак, наполовину срезанный нижним краем */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative z-0 -mb-[0.12em] select-none whitespace-nowrap text-center font-black uppercase leading-none tracking-tight"
        style={{
          fontSize: 'clamp(90px, 15.5vw, 300px)',
          color: 'transparent',
          WebkitTextStroke: '1.5px rgba(187, 204, 215, 0.4)',
        }}
      >
        Террикон
      </div>
    </footer>
  )
}
