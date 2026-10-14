import { BusinessForm } from '@/components/business/BusinessForm'
import { TrackedPhoneLink } from '@/components/metrics/TrackedPhoneLink'
import { Container } from '@/components/ui/Container'
import { IconCheck } from '@/components/ui/Icons'
import { org } from '@/lib/content'

export function BusinessRequest() {
  return (
    <section id="zapis" className="scroll-mt-20 bg-cream py-14 sm:py-20">
      <Container>
        <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_20px_60px_rgba(14,26,53,0.1)] ring-1 ring-navy/5 lg:grid lg:grid-cols-[0.76fr_1.24fr]">
          <div className="relative flex flex-col overflow-hidden bg-navy px-6 py-10 text-white sm:px-10 lg:px-12 lg:py-12">
            <div
              aria-hidden="true"
              className="absolute -right-28 -bottom-32 h-80 w-80 rounded-full border-[64px] border-teal/10"
            />

            <div className="relative">
              <p className="label text-teal">Для организаций</p>
              <h2 className="h2 mt-5 max-w-[14ch] text-[clamp(2rem,3.4vw,3.25rem)] text-white">
                Условия под ваш объём
              </h2>
              <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-white/65">
                Расскажите, сколько текстиля и формы вы сдаёте и как удобнее передавать вещи. По
                этим данным посчитаем цену и график.
              </p>

              <ul className="mt-9 space-y-4">
                {['Объём в месяц и за один раз', 'Нужный срок готовности', 'Забор и доставка или сами'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-3 text-[0.875rem] text-white/85">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-teal ring-1 ring-white/10">
                        <IconCheck className="h-3.5 w-3.5" />
                      </span>
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="relative mt-10 border-t border-white/10 pt-7 lg:mt-auto">
              <p className="text-[0.75rem] text-white/45">Удобнее обсудить по телефону?</p>
              <TrackedPhoneLink
                href={org.phones[0].href}
                className="mt-1 inline-block font-display text-[1.125rem] font-bold text-white transition-colors hover:text-teal"
              >
                {org.phones[0].display}
              </TrackedPhoneLink>
            </div>
          </div>

          <BusinessForm />
        </div>
      </Container>
    </section>
  )
}
