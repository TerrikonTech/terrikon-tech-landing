# Террикон Тех — лендинг студии разработки

Одностраничный русскоязычный сайт студии «Террикон Тех» из Донецка. Главная
цель страницы — показать подход и услуги команды и довести посетителя до
прямого контакта в Telegram.

**Прод:** https://www.terrikontech.ru
**Стек:** Vite · React 18 · TypeScript · Tailwind CSS 3.4 · Framer Motion 12

## Секции

1. **Hero** — две темы и запечённая 40-кадровая фигура поверх заголовка,
   которая без задержки реагирует на положение мыши.
2. **Визуальная марка** — две типографические motion-ленты направлений.
3. **О нас** — позиционирование студии и прямой CTA.
4. **Услуги** — пять направлений разработки.
5. **Как работаем** — четыре этапа от брифа до запуска.
6. **Проекты** — пять карточек: Space Voyage, CodeNest, Vex Ventures,
   Stellar AI и ASME.
7. **Вопросы до старта** — ответы о стоимости, сроках, процессе и поддержке.
8. **Команда** — сооснователи и специалисты под задачи проекта.
9. **Футер** — основной контакт и графика террикона.

## Запуск

```bash
npm install
npm run dev
npm run build
npm run preview
```

Dev-сервер Vite использует http://localhost:5175. Production-сборка попадает
в `dist/`.

## Hero-ассеты

Интерактивная фигура больше не декодирует и не перематывает MP4 в браузере.
`scripts/bake_subject_atlas.py` собирает исходные ролики и маски из
`assets/hero-source/` в четыре production-ассета:

- `public/subject-{light,dark}-frames.webp` — 40 прозрачных кадров, сетка 8×5;
- `public/subject-{light,dark}-poster.webp` — лёгкий статичный fallback.

Пересборка требует Python Playwright и установленный Chromium:

```bash
python scripts/bake_subject_atlas.py
```

## Производительность и доступность

- Шрифты, проектные превью и hero-медиа хранятся локально.
- На desktop один `pointermove` выбирает готовый кадр WebP-атласа и планирует
  не больше одной Canvas 2D-отрисовки на `requestAnimationFrame`.
- На touch, при `prefers-reduced-motion: reduce` и `Save-Data` загружается
  только прозрачный постер: без атласа, видео, WebGL и автоплея.
- Production-пререндер выполняет `scripts/prerender.py`, а
  `scripts/validate_build.py` проверяет SEO DOM и медиарегрессии.

## Деплой

Пуш в `main` запускает `.github/workflows/deploy-vercel.yml`: сборка,
пререндер, SEO-проверка, production-деплой и уведомление IndexNow. Прямой
`npx vercel --prod` не использовать — он пропускает обязательный пререндер.

Правила работы — в [AGENTS.md](AGENTS.md) и [CLAUDE.md](CLAUDE.md), визуальная
система — в [DESIGN.md](DESIGN.md).
