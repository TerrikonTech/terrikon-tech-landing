import FadeIn from './FadeIn'

export const FAQ_ITEMS = [
  {
    question: 'Сколько стоит разработка сайта?',
    answer:
      'Цена зависит от объёма, интеграций и готовности материалов. После короткого брифа мы называем диапазон, состав работ и фиксируем, что входит в запуск.',
  },
  {
    question: 'Сколько времени занимает проект?',
    answer:
      'Лендинг собирается быстрее сложного сервиса, поэтому универсального срока нет. До старта мы разбиваем работу на этапы и даём понятный календарный план.',
  },
  {
    question: 'Что нужно подготовить до начала?',
    answer:
      'Достаточно описать задачу, аудиторию и желаемый результат. Если нет структуры, текстов или визуального направления, поможем собрать их вместе.',
  },
  {
    question: 'С кем я буду общаться?',
    answer:
      'Напрямую с сооснователями и специалистами, которые делают продукт. Важные решения не теряются в цепочке менеджеров.',
  },
  {
    question: 'Вы работаете только в Донецке?',
    answer:
      'Мы находимся в Донецке, работаем с проектами из ДНР и ведём задачи удалённо по всей России.',
  },
  {
    question: 'Что происходит после запуска?',
    answer:
      'Передаём доступы и рабочие материалы, помогаем с публикацией и аналитикой. При необходимости остаёмся на поддержке и развиваем продукт дальше.',
  },
]

export default function FAQSection() {
  return (
    <section
      id="faq"
      className="bg-[#0C0C0C] px-5 py-20 sm:px-8 sm:py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <FadeIn y={36}>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#FF6A00] sm:text-sm">
            Коротко и по делу
          </p>
          <h2
            className="max-w-4xl font-display font-black leading-[0.95] tracking-tight text-[#D7E2EA]"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 96px)' }}
          >
            Вопросы до старта
          </h2>
        </FadeIn>

        <div className="mt-14 border-t border-[#D7E2EA]/20 sm:mt-20">
          {FAQ_ITEMS.map((item, index) => (
            <FadeIn key={item.question} delay={index * 0.04} y={16}>
              <details className="group border-b border-[#D7E2EA]/20">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-base font-semibold text-[#D7E2EA] outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0C0C0C] sm:py-8 sm:text-xl [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-3xl font-normal text-[#FF6A00] transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-3xl pb-7 pr-10 leading-relaxed text-[#D7E2EA]/65 sm:pb-9 sm:text-lg">
                  {item.answer}
                </p>
              </details>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
