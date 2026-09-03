import { TrackedPhoneLink } from '@/components/metrics/TrackedPhoneLink'
import { OrderForm } from '@/components/order/OrderForm'
import { Container } from '@/components/ui/Container'
import { IconCheck } from '@/components/ui/Icons'
import { org } from '@/lib/content'

export function OnlineOrder() {
  return (
    <section id="zapis" className="scroll-mt-20 bg-cream py-14 sm:py-20">
      <Container>
        <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_20px_60px_rgba(14,26,53,0.1)] ring-1 ring-navy/5 lg:grid lg:grid-cols-[0.76fr_1.24fr]">
          <div className="relative flex flex-col overflow-hidden bg-navy px-6 py-10 text-white sm:px-10 lg:min-h-[39rem] lg:px-12 lg:py-12">
            <div
              aria-hidden="true"
              className="absolute -right-28 -bottom-32 h-80 w-80 rounded-full border-[64px] border-teal/10"
            />

            <div className="relative">
              <p className="label text-teal">Онлайн-заявка</p>
              <h2 className="h2 mt-5 max-w-[12ch] text-[clamp(2rem,3.4vw,3.25rem)] text-white">
                Всё важное — в трёх шагах
              </h2>
              <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-white/65">
                Расскажите о вещи заранее. Менеджер получит понятную заявку и свяжется с вами для
                подтверждения.
              </p>

              <ol className="mt-9 space-y-4">
                {[
                  'Оставьте контакты',
                  'Выберите изделие и срочность',
                  'Опишите загрязнение',
                ].map((item, index) => (
                  <li key={item} className="flex items-center gap-3 text-[0.875rem] text-white/85">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[0.6875rem] font-bold text-teal ring-1 ring-white/10">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            <div className="relative mt-10 border-t border-white/10 pt-7 lg:mt-auto">
              <p className="flex items-start gap-2.5 text-[0.75rem] leading-relaxed text-white/55">
                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                Отправка формы бесплатна и ни к чему не обязывает. Срок и стоимость подтвердит
                менеджер.
              </p>
              <p className="mt-5 text-[0.75rem] text-white/45">Удобнее обсудить по телефону?</p>
              <TrackedPhoneLink
                href={org.phones[0].href}
                className="mt-1 inline-block font-display text-[1.125rem] font-bold text-white transition-colors hover:text-teal"
              >
                {org.phones[0].display}
              </TrackedPhoneLink>
            </div>
          </div>

          <OrderForm />
        </div>
      </Container>
    </section>
  )
}
