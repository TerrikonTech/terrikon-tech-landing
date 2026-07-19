import FadeIn from './FadeIn'

const STEPS = [
  {
    number: '01',
    title: 'Разбираем задачу',
    text: 'На коротком созвоне фиксируем цель, аудиторию, ограничения и критерии готового результата.',
  },
  {
    number: '02',
    title: 'Показываем направление',
    text: 'Собираем структуру, прототип и визуальный подход, чтобы договориться о главном до разработки.',
  },
  {
    number: '03',
    title: 'Собираем и проверяем',
    text: 'Разрабатываем по этапам, проверяем адаптив, скорость, сценарии и аналитику на реальных устройствах.',
  },
  {
    number: '04',
    title: 'Запускаем и остаёмся рядом',
    text: 'Разворачиваем продукт, передаём доступы и продолжаем поддержку, если проекту нужно развитие.',
  },
]

export default function ProcessSection() {
  return (
    <section
      id="process"
      className="bg-white px-5 pb-36 pt-20 sm:px-8 sm:pb-44 sm:pt-24 md:px-10 md:pb-52 md:pt-32"
    >
      <div className="mx-auto max-w-6xl">
        <FadeIn y={36}>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#FF6A00] sm:text-sm">
            От первого сообщения до запуска
          </p>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2
              className="max-w-4xl font-display font-black leading-[0.95] tracking-tight text-[#0C0C0C]"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 96px)' }}
            >
              Как работаем
            </h2>
            <p className="max-w-md leading-relaxed text-[#0C0C0C]/65 md:text-lg">
              Четыре понятных этапа. После каждого видно, что уже готово и что
              делаем дальше.
            </p>
          </div>
        </FadeIn>

        <div className="mt-16 grid gap-10 sm:mt-20 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((step, index) => (
            <FadeIn key={step.number} delay={index * 0.08} y={24}>
              <article className="group border-t border-[#0C0C0C]/20 pt-5">
                <span className="font-display text-sm font-bold text-[#FF6A00]">
                  {step.number}
                </span>
                <h3 className="mt-8 font-display text-xl font-semibold text-[#0C0C0C] transition-transform duration-300 group-hover:translate-x-1">
                  {step.title}
                </h3>
                <p className="mt-4 leading-relaxed text-[#0C0C0C]/65">
                  {step.text}
                </p>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
