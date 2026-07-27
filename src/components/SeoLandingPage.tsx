import { useEffect } from 'react'
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react'
import ContactButton, { TELEGRAM_URL } from './ContactButton'
import LogoMark from './LogoMark'
import { SEO_PAGES, type SeoPage } from '../seoPages'

const SITE_URL = 'https://www.terrikontech.ru'

function setMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([name, value]) => {
    element?.setAttribute(name, value)
  })
}

function setLink(id: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLLinkElement>(`#${id}`)
  if (!element) {
    element = document.createElement('link')
    element.id = id
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([name, value]) => {
    element?.setAttribute(name, value)
  })
}

function SeoHead({ page }: { page: SeoPage }) {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}/${page.slug}/`
    document.title = page.title

    setMeta('meta[name="description"]', {
      name: 'description',
      content: page.description,
    })
    setMeta('meta[name="keywords"]', {
      name: 'keywords',
      content: page.keywords.join(', '),
    })
    setMeta('meta[name="robots"]', {
      name: 'robots',
      content:
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    })
    setMeta('meta[name="geo.placename"]', {
      name: 'geo.placename',
      content: 'Донецк',
    })
    setMeta('meta[property="og:type"]', {
      property: 'og:type',
      content: 'website',
    })
    setMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: page.title,
    })
    setMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: page.description,
    })
    setMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: canonicalUrl,
    })
    setMeta('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: page.title,
    })
    setMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: page.description,
    })

    const canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    )
    canonical?.setAttribute('href', canonicalUrl)
    setLink('alternate-ru', {
      rel: 'alternate',
      hrefLang: 'ru-RU',
      href: canonicalUrl,
    })
    setLink('alternate-default', {
      rel: 'alternate',
      hrefLang: 'x-default',
      href: canonicalUrl,
    })

    document.getElementById('site-jsonld')?.remove()
    document.getElementById('page-jsonld')?.remove()

    const jsonLd = document.createElement('script')
    jsonLd.id = 'page-jsonld'
    jsonLd.type = 'application/ld+json'
    jsonLd.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: page.title,
          description: page.description,
          inLanguage: 'ru-RU',
          isPartOf: { '@id': `${SITE_URL}/#website` },
          about: { '@id': `${canonicalUrl}#service` },
          breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
        },
        {
          '@type': 'Service',
          '@id': `${canonicalUrl}#service`,
          name: page.serviceType,
          description: page.description,
          url: canonicalUrl,
          provider: { '@id': `${SITE_URL}/#organization` },
          areaServed: [
            { '@type': 'City', name: 'Донецк' },
            { '@type': 'AdministrativeArea', name: 'Донецкая Народная Республика' },
            { '@type': 'Country', name: 'Россия' },
          ],
          availableChannel: {
            '@type': 'ServiceChannel',
            serviceUrl: TELEGRAM_URL,
            availableLanguage: 'ru',
          },
        },
        {
          '@type': ['Organization', 'ProfessionalService'],
          '@id': `${SITE_URL}/#organization`,
          name: 'Террикон Тех',
          alternateName: 'TerrikonTech',
          url: `${SITE_URL}/`,
          logo: `${SITE_URL}/logo-mark.png`,
          image: `${SITE_URL}/og.jpg`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Донецк',
            addressCountry: 'RU',
          },
          areaServed: [
            'Донецк',
            'Донецкая Народная Республика',
            'Россия',
          ],
          sameAs: ['https://github.com/TerrikonTech'],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'sales',
            url: TELEGRAM_URL,
            availableLanguage: 'ru',
          },
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${canonicalUrl}#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Террикон Тех',
              item: `${SITE_URL}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: page.heading,
              item: canonicalUrl,
            },
          ],
        },
        {
          '@type': 'FAQPage',
          '@id': `${canonicalUrl}#faq`,
          mainEntity: page.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        },
      ],
    })
    document.head.appendChild(jsonLd)
  }, [page])

  return null
}

const PROCESS = [
  ['01', 'Разбираем задачу', 'Цели, аудитория, ограничения и критерии результата.'],
  ['02', 'Проектируем', 'Структура, сценарии, прототип и техническое решение.'],
  ['03', 'Создаём', 'Дизайн, разработка, интеграции и контент.'],
  ['04', 'Проверяем', 'Мобильные устройства, скорость, ошибки и аналитика.'],
  ['05', 'Запускаем', 'Production, индексация, мониторинг и дальнейшее развитие.'],
]

export default function SeoLandingPage({ page }: { page: SeoPage }) {
  const related = SEO_PAGES.filter((candidate) => candidate.slug !== page.slug).slice(
    0,
    3,
  )

  return (
    <main className="min-h-screen overflow-x-clip bg-[#0C0C0C] font-sans text-[#D7E2EA]">
      <SeoHead page={page} />

      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 md:px-10">
        <a href="/" aria-label="Террикон Тех — главная" className="flex items-center gap-3">
          <LogoMark className="h-7 w-8 bg-[#BBCCD7]" />
          <span className="font-display text-lg font-bold sm:text-xl">Террикон Тех</span>
        </a>
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:border-[#FF6A00] hover:text-white sm:text-sm"
        >
          Обсудить проект
        </a>
      </header>

      <section className="px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-20 md:px-10 md:pb-36">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Хлебные крошки" className="mb-10 text-sm text-[#D7E2EA]/55">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <a href="/" className="transition-colors hover:text-white">
                  Главная
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{page.heading}</li>
            </ol>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#FF6A00] sm:text-sm">
            {page.eyebrow}
          </p>
          <h1
            className="mt-6 max-w-6xl font-display font-black leading-[0.94] tracking-tight text-[#D7E2EA]"
            style={{ fontSize: 'clamp(3rem, 9vw, 126px)' }}
          >
            {page.heading}
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-[#D7E2EA]/75 sm:text-xl md:text-2xl">
            {page.lead}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <ContactButton>Получить оценку</ContactButton>
            <a
              href="/#projects"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#D7E2EA]/70 transition-colors hover:text-white"
            >
              Смотреть проекты <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="rounded-t-[40px] bg-white px-5 py-20 text-[#0C0C0C] sm:rounded-t-[56px] sm:px-8 sm:py-28 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF6A00] sm:text-sm">
              Подход
            </p>
            <h2 className="mt-5 font-display text-4xl font-black leading-tight sm:text-5xl">
              Сначала смысл,
              <br /> затем интерфейс
            </h2>
          </div>
          <div className="space-y-6 text-base leading-relaxed text-black/70 sm:text-lg">
            {page.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-7xl gap-px overflow-hidden rounded-3xl border border-black/10 bg-black/10 sm:grid-cols-2">
          {page.features.map((feature, index) => (
            <article key={feature.title} className="bg-white p-7 sm:p-10">
              <span className="font-display text-sm font-bold text-[#FF6A00]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
                {feature.title}
              </h3>
              <p className="mt-4 leading-relaxed text-black/60">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28 md:px-10 md:py-36">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF6A00] sm:text-sm">
            Что получает бизнес
          </p>
          <h2 className="mt-5 max-w-4xl font-display text-4xl font-black leading-tight sm:text-6xl">
            Результат, который можно развивать
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {page.outcomes.map((outcome) => (
              <div key={outcome} className="rounded-3xl border border-white/12 p-7 sm:p-8">
                <Check className="h-6 w-6 text-[#FF6A00]" />
                <p className="mt-5 text-base leading-relaxed text-[#D7E2EA]/75 sm:text-lg">
                  {outcome}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#D7E2EA] px-5 py-20 text-[#0C0C0C] sm:px-8 sm:py-28 md:px-10 md:py-36">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF6A00] sm:text-sm">
            Этапы работы
          </p>
          <h2 className="mt-5 font-display text-4xl font-black sm:text-6xl">От задачи до запуска</h2>
          <ol className="mt-12 border-t border-black/20">
            {PROCESS.map(([number, title, description]) => (
              <li
                key={number}
                className="grid gap-3 border-b border-black/20 py-7 sm:grid-cols-[80px_0.8fr_1.2fr] sm:items-center sm:gap-8 sm:py-9"
              >
                <span className="font-display text-sm font-bold text-[#FF6A00]">{number}</span>
                <h3 className="font-display text-xl font-bold sm:text-2xl">{title}</h3>
                <p className="leading-relaxed text-black/60">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="faq" className="px-5 py-20 sm:px-8 sm:py-28 md:px-10 md:py-36">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF6A00] sm:text-sm">
            Частые вопросы
          </p>
          <h2 className="mt-5 font-display text-4xl font-black sm:text-6xl">Коротко о важном</h2>
          <div className="mt-12 border-t border-white/15">
            {page.faq.map((item) => (
              <details key={item.question} className="group border-b border-white/15">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-8 py-7 font-display text-lg font-semibold sm:text-2xl [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span aria-hidden="true" className="text-3xl text-[#FF6A00] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-3xl pb-8 leading-relaxed text-[#D7E2EA]/65 sm:text-lg">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 text-[#0C0C0C] sm:px-8 sm:py-28 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF6A00] sm:text-sm">
            Другие направления
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {related.map((candidate) => (
              <a
                key={candidate.slug}
                href={`/${candidate.slug}/`}
                className="group flex min-h-48 flex-col justify-between rounded-3xl border border-black/10 p-7 transition-colors hover:border-[#FF6A00]"
              >
                <h2 className="font-display text-2xl font-bold leading-tight">{candidate.heading}</h2>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                  Подробнее
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-5 py-16 sm:px-8 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <a href="/" className="inline-flex items-center gap-3">
              <ArrowLeft className="h-5 w-5 text-[#FF6A00]" />
              <span className="font-display text-2xl font-bold">Террикон Тех</span>
            </a>
            <address className="mt-5 max-w-md text-sm not-italic leading-relaxed text-[#D7E2EA]/60 sm:text-base">
              Студия из Донецка. Работаем с компаниями в ДНР, новых регионах и по всей России.
            </address>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-white">
              Telegram: @Zotov_O
            </a>
            <a href="/privacy.html" className="text-sm text-[#D7E2EA]/55 hover:text-white">
              Политика обработки данных
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
