import { OrderForm } from '@/components/order/OrderForm'
import { Container } from '@/components/ui/Container'

export function OnlineOrder() {
  return (
    <section id="zapis" className="scroll-mt-24 bg-bone py-16 sm:py-20">
      <Container className="grid items-start gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
        <div className="lg:sticky lg:top-28">
          <p className="label text-teal">Онлайн-заявка</p>
          <h2 className="h2 mt-4 text-[clamp(2rem,3.3vw,3.25rem)] text-navy">
            Расскажите, что нужно почистить
          </h2>
          <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-slate">
            Выберите изделие, срочность и вид загрязнения. Менеджер получит готовую информацию и
            свяжется с вами для подтверждения заказа.
          </p>
          <p className="mt-5 rounded-xl border border-navy/10 bg-white/55 px-4 py-3 text-[0.8125rem] leading-relaxed text-slate">
            Отправка формы не является приёмом изделия в работу. Итоговый срок и стоимость
            подтверждаются менеджером.
          </p>
        </div>

        <OrderForm />
      </Container>
    </section>
  )
}
