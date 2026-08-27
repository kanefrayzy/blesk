import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { PendingBadge } from '@/components/ui/PendingBadge'
import { pending } from '@/lib/content'

export function Cabinet() {
  return (
    <section id="kak-rabotaet" aria-labelledby="cabinet-title" className="overflow-hidden bg-navy">
      <Container className="grid items-center gap-12 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:py-20">
        <div>
          <h2
            id="cabinet-title"
            className="h2 max-w-[16ch] text-[clamp(1.5rem,2.6vw,2.125rem)] text-white"
          >
            Ваши вещи под полным цифровым контролем
          </h2>

          <p className="mt-6 max-w-[44ch] text-[0.9375rem] leading-relaxed text-white/70">
            От приёма до выдачи: отслеживайте статус заказа и храните историю в личном кабинете.
          </p>

          <p className="mt-7 max-w-[46ch] rounded-lg border border-dashed border-white/25 px-4 py-3 text-[0.8125rem] leading-snug text-white/60">
            <PendingBadge tone="dark">Заглушка</PendingBadge>
            {pending.apps} и {pending.cabinet}: на месте бейджей App&nbsp;Store и Google&nbsp;Play
            появятся ссылки, когда приложения выйдут.
          </p>
        </div>

        {/* Кадр со снятым фоном: устройства стоят прямо на морском поле секции */}
        <div className="relative mx-auto w-full max-w-[34rem]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[10%] top-[14%] bottom-[10%] rounded-full bg-teal/12 blur-3xl"
          />
          <Image
            src="/photo/cabinet-devices.webp"
            alt="Личный кабинет «Блеска» на ноутбуке и телефоне"
            width={1200}
            height={799}
            sizes="(max-width: 1023px) 90vw, 544px"
            className="relative h-auto w-full"
          />
        </div>
      </Container>
    </section>
  )
}
