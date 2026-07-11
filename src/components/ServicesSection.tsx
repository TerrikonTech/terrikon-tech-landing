import FadeIn from './FadeIn'
import ContactButton from './ContactButton'

const SERVICES = [
  {
    number: '01',
    name: 'Лендинги под ключ',
    description:
      'Продающие лендинги от макета до продакшена: дизайн, вёрстка, анимации, деплой и аналитика — за считанные дни.',
  },
  {
    number: '02',
    name: 'Фулстек-разработка',
    description:
      'Полный цикл: фронтенд, бэкенд, базы данных, API и интеграции. Одна команда ведёт проект от архитектуры до релиза.',
  },
  {
    number: '03',
    name: 'Приложения',
    description:
      'Веб- и мобильные приложения: PWA, Telegram Mini Apps, личные кабинеты — быстрые, живучие в офлайне, с уведомлениями.',
  },
  {
    number: '04',
    name: 'Платформы и сервисы',
    description:
      'Нагруженные онлайн-платформы: карты и реалтайм, админки, платежи, аналитика. Масштабируются вместе с вашим бизнесом.',
  },
  {
    number: '05',
    name: 'Программное обеспечение',
    description:
      'Софт под задачу: автоматизация, боты, парсеры, интеграции с железом и внешними API. Поддержка и развитие после запуска.',
  },
]

export default function ServicesSection() {
  return (
    <section
      id="price"
      className="rounded-t-[40px] bg-[#FFFFFF] px-5 py-20 sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
    >
      <FadeIn y={40}>
        <h2
          className="mb-16 text-center font-display font-black leading-none tracking-tight text-[#0C0C0C] sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Услуги
        </h2>
      </FadeIn>

      <div className="mx-auto max-w-5xl">
        {SERVICES.map((service, i) => (
          <FadeIn key={service.number} delay={i * 0.1}>
            <div
              className="group relative flex flex-col gap-2 py-8 sm:gap-3 sm:py-10 md:py-12"
              style={{
                borderBottom:
                  i < SERVICES.length - 1
                    ? '1px solid rgba(12, 12, 12, 0.15)'
                    : undefined,
              }}
            >
              {/* Ховер: слева вырастает сигнальная черта, пункт подаётся
                  вправо, справа проявляется стрелка — список живой */}
              <span
                aria-hidden="true"
                className="absolute inset-y-8 left-0 w-[3px] origin-top scale-y-0 bg-[#FF6A00] transition-transform duration-300 ease-out group-hover:scale-y-100 sm:inset-y-10 md:inset-y-12"
              />
              <span
                aria-hidden="true"
                className="absolute right-2 top-1/2 -translate-y-1/2 translate-x-3 font-display text-2xl text-[#FF6A00] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:text-3xl"
              >
                →
              </span>
              {/* Услуги — не последовательность шагов: гигантские цифры
                  демонтированы в каталожный индекс, вес — названию услуги */}
              <span
                className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FF6A00] transition-transform duration-300 ease-out group-hover:translate-x-5 sm:text-sm"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {service.number}
              </span>
              <h3
                className="font-display font-semibold text-[#0C0C0C] transition-transform duration-300 ease-out group-hover:translate-x-5"
                style={{ fontSize: 'clamp(1.35rem, 2.8vw, 2.5rem)' }}
              >
                {service.name}
              </h3>
              <p
                className="max-w-2xl font-normal leading-relaxed text-[#0C0C0C] opacity-60 transition-all duration-300 ease-out group-hover:translate-x-5 group-hover:opacity-80"
                style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)' }}
              >
                {service.description}
              </p>
            </div>
          </FadeIn>
        ))}

        {/* CTA в горячей точке: пользователь только что прочитал услуги */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col items-center gap-6 pt-16 text-center sm:pt-20">
            <p
              className="max-w-xl font-normal leading-relaxed text-[#0C0C0C] opacity-70"
              style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.35rem)' }}
            >
              Не нашли свою задачу? Расскажите, что нужно, — соберём решение
              под вас.
            </p>
            <ContactButton variant="dark">Обсудить задачу</ContactButton>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
