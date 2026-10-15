import { TrackedPhoneLink } from '@/components/metrics/TrackedPhoneLink'
import { ServiceButton } from '@/components/service/ServiceButton'
import { Container } from '@/components/ui/Container'
import { IconCheck } from '@/components/ui/Icons'
import { org } from '@/lib/content'
import type { CmsService } from '@/lib/cmsTypes'

/** Цены одной карточкой, по образцу блока онлайн-заявки на главной. */
export function ServicePrices({ page }: { page: CmsService }) {
  const factors = page.factors

  return (
    <section id="ceny" className="scroll-mt-20 bg-cream py-14 sm:py-20">
      <Container>
        <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_20px_60px_rgba(14,26,53,0.1)] ring-1 ring-navy/5 lg:grid lg:grid-cols-[0.76fr_1.24fr]">
          <div className="relative flex flex-col overflow-hidden bg-navy px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
            <div
              aria-hidden="true"
              className="absolute -right-28 -bottom-32 h-80 w-80 rounded-full border-[64px] border-teal/10"
            />

            <div className="relative">
              <h2 className="h2 text-[clamp(1.75rem,3.2vw,2.75rem)] text-white">Сколько стоит</h2>
              {page.price ? (
                <p className="mt-7">
                  <span className="block font-display text-[clamp(2.25rem,4vw,3.5rem)] leading-none font-bold text-teal tabular-nums">
                    {page.price}
                  </span>
                  <span className="mt-3 block text-[0.875rem] text-white/60">{page.priceNote}</span>
                </p>
              ) : (
                <p className="mt-6 max-w-[16ch] font-display text-[clamp(1.25rem,2vw,1.625rem)] leading-snug font-bold text-teal">
                  {page.priceNote}
                </p>
              )}
              <p className="mt-6 max-w-[38ch] text-[0.9375rem] leading-relaxed text-white/70">
                {page.priceText}
              </p>
            </div>

            <div className="relative mt-10 lg:mt-auto lg:pt-10">
              <ServiceButton>{page.cta}</ServiceButton>
              <p className="mt-6 text-[0.75rem] text-white/50">Удобнее обсудить по телефону?</p>
              <TrackedPhoneLink
                href={org.phones[0].href}
                className="mt-1 inline-block font-display text-[1.125rem] font-bold text-white transition-colors hover:text-teal"
              >
                {org.phones[0].display}
              </TrackedPhoneLink>
            </div>
          </div>

          <div className="flex flex-col px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
            {page.prices.length > 0 && (
              <dl className="mb-10">
                {page.prices.map((p) => (
                  <div key={p.item} className="flex items-baseline gap-3 py-3.5">
                    <dt className="text-[1rem] text-navy">{p.item}</dt>
                    <span
                      aria-hidden="true"
                      className="min-w-6 flex-1 translate-y-[-0.3em] border-b border-dotted border-navy/25"
                    />
                    <dd className="shrink-0 font-display text-[1.0625rem] font-bold text-navy tabular-nums">
                      {p.price}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {factors.length > 0 && (
              <div className="mt-auto rounded-2xl bg-cream p-6">
                <h3 className="font-display text-[1.0625rem] font-bold text-navy">От чего зависит цена</h3>
                <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {factors.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[0.9375rem] text-navy">
                      <IconCheck className="h-4 w-4 shrink-0 text-teal" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
