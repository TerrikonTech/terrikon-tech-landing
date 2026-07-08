# Jack — 3D Creator (лендинг-портфолио)

Одностраничный лендинг-портфолио 3D-креатора Jack. Тёмная тема (#0C0C0C), шрифт Kanit, тяжёлая скролл-анимация.

**Стек:** Vite · React 18 · TypeScript · Tailwind CSS 3.4 · Framer Motion 12 · Lucide React

## Секции
1. **Hero** — градиентный заголовок «HI, I'M JACK», навбар, портрет с магнитным hover-эффектом (следует за курсором), градиентная кнопка Contact Me.
2. **Marquee** — две встречные ленты из 21 GIF-превью, движутся от позиции скролла страницы.
3. **About** — 4 декоративных 3D-иконки по углам, посимвольное проявление текста при скролле (opacity 0.2 → 1).
4. **Services** — белая секция со скруглённым верхом, 5 услуг с крупной нумерацией.
5. **Projects** — sticky-стек из 3 карточек: каждая липнет к верху и уменьшается, пока следующая наезжает поверх.

## Запуск
```bash
npm install
npm run dev     # dev-сервер Vite на http://localhost:5175
npm run build   # прод-сборка (tsc + vite build) в dist/
```

## Структура
- `src/components/` — секции (`HeroSection`, `MarqueeSection`, `AboutSection`, `ServicesSection`, `ProjectsSection`) и переиспользуемые компоненты (`FadeIn`, `Magnet`, `AnimatedText`, `ContactButton`, `LiveProjectButton`).
- Все картинки — внешние URL (figma.site, motionsites.ai, images.higgs.ai), локальных ассетов нет.

Правила работы с репозиторием — в [CLAUDE.md](CLAUDE.md) / [AGENTS.md](AGENTS.md).
