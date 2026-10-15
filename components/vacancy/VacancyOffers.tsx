import { BrandIcon } from '@/components/ui/BrandIcon'
import { Container } from '@/components/ui/Container'
import type { VacanciesPageContent } from '@/lib/cmsTypes'

export function VacancyOffers({ page }: { page: VacanciesPageContent }) {
  const { offers } = page

  return (
    <section className="bg-white">
      <Container className="grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-24">
        <div>
          <h2 className="h2 text-[clamp(1.75rem,3.2vw,2.75rem)] text-navy">{offers.title}</h2>
          <p className="mt-5 max-w-[38ch] text-[1.0625rem] leading-relaxed text-slate">{offers.text}</p>
        </div>

        <dl className="border-t border-line">
          {offers.items.map((o) => (
            <div key={o.name} className="flex items-center gap-5 border-b border-line py-5">
              <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-cream">
                <BrandIcon name={o.icon} className="h-7 w-7" />
              </span>
              <div>
                <dt className="font-display text-[1.125rem] leading-snug font-bold text-navy">{o.name}</dt>
                <dd className="mt-1 text-[1rem] leading-relaxed text-slate">{o.text}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}
