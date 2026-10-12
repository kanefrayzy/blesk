import Image from 'next/image'
import { TrackedPhoneLink } from '@/components/metrics/TrackedPhoneLink'
import { ApplyButton } from '@/components/vacancy/ApplyButton'
import { Container } from '@/components/ui/Container'
import { IconCheck } from '@/components/ui/Icons'
import { org } from '@/lib/content'
import { vacancies, vacanciesPage } from '@/lib/vacanciesPage'

function Points({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <h4 className="label text-teal">{title}</h4>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-[0.9375rem] leading-snug text-navy">
            <IconCheck className="mt-[0.15em] h-4 w-4 shrink-0 text-teal" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Должности карточками; шестая ячейка сетки — условия и телефон. */
export function VacancyList() {
  const { list } = vacanciesPage

  return (
    <section id="vakansii" className="scroll-mt-20 bg-cream">
      <Container className="py-14 lg:py-24">
        <h2 className="h2 text-[clamp(1.75rem,3.2vw,2.75rem)] text-navy">{list.title}</h2>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6">
          {vacancies.map((v) => (
            <li key={v.key}>
              <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white">
                <div className="relative aspect-[3/2]">
                  <Image
                    src={v.photo}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 46vw, 92vw"
                    className="object-cover"
                    style={{ objectPosition: v.focus }}
                  />
                </div>

                <div className="flex grow flex-col p-6 lg:p-7">
                  <h3 className="font-display text-[1.375rem] leading-tight font-bold text-navy">{v.title}</h3>
                  <p className="mt-2.5 text-[1rem] leading-relaxed text-slate">{v.summary}</p>

                  <div className="mt-6 space-y-6">
                    <Points title="Обязанности" items={v.duties} />
                    <Points title="Требования" items={v.requirements} />
                  </div>

                  <div className="mt-auto pt-7">
                    <ApplyButton title={v.title} />
                  </div>
                </div>
              </article>
            </li>
          ))}

          <li>
            <div className="flex h-full flex-col rounded-3xl bg-navy p-7 text-white lg:p-9">
              <h3 className="font-display text-[1.375rem] leading-tight font-bold">{list.terms.title}</h3>
              <p className="mt-3 text-[1rem] leading-relaxed text-white/72">{list.terms.text}</p>

              <div className="mt-auto pt-10">
                <p className="text-[0.875rem] text-white/60">Позвонить</p>
                <TrackedPhoneLink
                  href={org.phones[0].href}
                  className="mt-1 inline-block font-display text-[1.5rem] font-bold tabular-nums transition-colors hover:text-teal"
                >
                  {org.phones[0].display}
                </TrackedPhoneLink>
              </div>
            </div>
          </li>
        </ul>
      </Container>
    </section>
  )
}
