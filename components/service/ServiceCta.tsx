import { TrackedPhoneLink } from '@/components/metrics/TrackedPhoneLink'
import { ServiceButton } from '@/components/service/ServiceButton'
import { Container } from '@/components/ui/Container'
import { org } from '@/lib/content'

export function ServiceCta({ business = false }: { business?: boolean }) {
  return (
    <section className="bg-bone">
      <Container className="flex flex-col gap-8 py-14 lg:flex-row lg:items-center lg:justify-between lg:py-16">
        <div>
          <h2 className="h2 max-w-[22ch] text-[clamp(1.5rem,2.6vw,2rem)] text-navy">
            {business ? 'Расскажите об объёме — посчитаем условия' : 'Расскажите о вещи — посчитаем заранее'}
          </h2>
          <p className="mt-3 max-w-[52ch] text-[0.9375rem] leading-relaxed text-navy/70">
            Заявка бесплатна и ни к чему не обязывает.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          <ServiceButton>{business ? 'Получить предложение' : 'Оставить заявку'}</ServiceButton>
          <p>
            <span className="block text-[0.75rem] text-navy/60">Или по телефону</span>
            <TrackedPhoneLink
              href={org.phones[0].href}
              className="mt-1 inline-block font-display text-[1.125rem] font-bold text-navy transition-colors hover:text-teal"
            >
              {org.phones[0].display}
            </TrackedPhoneLink>
          </p>
        </div>
      </Container>
    </section>
  )
}
