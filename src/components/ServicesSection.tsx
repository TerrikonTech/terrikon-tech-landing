import FadeIn from './FadeIn'

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
          className="mb-16 text-center font-black uppercase leading-none tracking-tight text-[#0C0C0C] sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Услуги
        </h2>
      </FadeIn>

      <div className="mx-auto max-w-5xl">
        {SERVICES.map((service, i) => (
          <FadeIn key={service.number} delay={i * 0.1}>
            <div
              className="flex items-start gap-6 py-8 sm:gap-10 sm:py-10 md:gap-16 md:py-12"
              style={{
                borderBottom:
                  i < SERVICES.length - 1
                    ? '1px solid rgba(12, 12, 12, 0.15)'
                    : undefined,
              }}
            >
              <span
                className="font-black leading-none text-[#0C0C0C]"
                style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
              >
                {service.number}
              </span>
              <div className="flex flex-col gap-2 pt-2 sm:gap-3 md:pt-4">
                <h3
                  className="font-medium uppercase text-[#0C0C0C]"
                  style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
                >
                  {service.name}
                </h3>
                <p
                  className="max-w-2xl font-light leading-relaxed text-[#0C0C0C] opacity-60"
                  style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)' }}
                >
                  {service.description}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
