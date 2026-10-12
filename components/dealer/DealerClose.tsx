import { DealerForm } from '@/components/dealer/DealerForm'
import { TrackedPhoneLink } from '@/components/metrics/TrackedPhoneLink'
import { Container } from '@/components/ui/Container'
import { org } from '@/lib/content'
import { dealerPage } from '@/lib/dealerPage'

export function DealerClose() {
  return (
    <section id="zayavka" className="scroll-mt-20 bg-cream">
      <Container className="grid gap-12 py-14 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:py-24">
        <div className="lg:pt-6">
          <h2 className="h2 max-w-[19ch] text-[clamp(1.875rem,3.6vw,3rem)] text-balance text-navy">
            {dealerPage.promise}
          </h2>
          <p className="mt-6 max-w-[42ch] text-[1.0625rem] leading-relaxed text-slate">{dealerPage.money.text}</p>

          <h3 className="mt-10 font-display text-[1.0625rem] font-bold text-navy">Где ждём партнёров</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {dealerPage.cities.map((c) => (
              <li
                key={c}
                className="rounded-full bg-white px-4 py-2.5 text-[0.875rem] leading-none font-semibold text-navy ring-1 ring-navy/8"
              >
                {c}
              </li>
            ))}
          </ul>

          <p className="mt-10 text-[0.875rem] text-slate">Удобнее обсудить по телефону?</p>
          <TrackedPhoneLink
            href={org.phones[0].href}
            className="mt-1 inline-block font-display text-[1.375rem] font-bold text-navy tabular-nums transition-colors hover:text-teal"
          >
            {org.phones[0].display}
          </TrackedPhoneLink>
        </div>

        <div className="self-start rounded-[1.5rem] bg-white shadow-[0_20px_60px_rgba(14,26,53,0.1)] ring-1 ring-navy/5">
          <DealerForm />
        </div>
      </Container>
    </section>
  )
}
