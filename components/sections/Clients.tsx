import { Container } from '@/components/ui/Container'
import { IconArrow } from '@/components/ui/Icons'
import { TrackedPhoneLink } from '@/components/metrics/TrackedPhoneLink'
import { org, demoClients } from '@/lib/content'

/** Марки клиентов демонстрационные — см. предупреждение над demoClients. */
export function Clients() {
  return (
    <section id="biznes" aria-labelledby="clients-title" className="relative overflow-hidden bg-navy">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 h-[34rem] w-[34rem] rounded-full bg-teal/10 blur-[130px]"
      />

      <Container className="relative grid gap-12 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-20 lg:py-24">
        <div>
          <p className="label text-teal">Для бизнеса</p>

          <h2
            id="clients-title"
            className="h2 mt-4 max-w-[16ch] text-[clamp(1.625rem,2.6vw,2.25rem)] text-white"
          >
            Нам доверяют бизнес-клиенты
          </h2>

          <p className="mt-5 max-w-[44ch] text-[0.9375rem] leading-relaxed text-white/70">
            Рестораны, гостиницы, салоны красоты, медицинские центры и фитнес-клубы. Регулярное
            обслуживание текстиля сотрудников: стабильное качество и удобный документооборот.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <TrackedPhoneLink
              href={org.phones[0].href}
              className="inline-flex h-12 items-center rounded-full bg-teal px-6 font-display text-[0.875rem] font-bold text-white shadow-[0_10px_28px_rgba(17,184,194,0.24)] transition-[background-color,transform,box-shadow] duration-200 hover:bg-teal-hi hover:shadow-[0_12px_34px_rgba(17,184,194,0.34)] active:scale-[0.97]"
            >
              {org.phones[0].display}
            </TrackedPhoneLink>
            <a
              href={`mailto:${org.email}`}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/35 px-6 font-display text-[0.875rem] font-bold text-white transition-[background-color,border-color,transform] duration-200 hover:border-white hover:bg-white/10 active:scale-[0.97]"
            >
              Написать на почту
              <IconArrow className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Сетка, а не flex-wrap: иначе пятая марка уезжает на свою строку */}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {demoClients.map((c) => (
            <li
              key={c.name}
              className="flex h-[6.25rem] flex-col items-center justify-center rounded-2xl bg-white/[0.06] px-2 text-center ring-1 ring-white/12 transition-[background-color,transform] duration-300 hover:-translate-y-1 hover:bg-white/10"
            >
              <span className="font-display text-[0.9375rem] leading-tight font-bold tracking-tight text-white">
                {c.name}
              </span>
              <span className="mt-2 text-[0.5625rem] tracking-[0.14em] text-white/45 uppercase">
                {c.kind}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
