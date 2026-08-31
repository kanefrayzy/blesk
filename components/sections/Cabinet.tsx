import { Container } from '@/components/ui/Container'
import { CabinetMock } from '@/components/sections/CabinetMock'
import { IconArrow } from '@/components/ui/Icons'
import Link from 'next/link'

export function Cabinet() {
  return (
    <section id="kak-rabotaet" aria-labelledby="cabinet-title" className="overflow-hidden bg-navy">
      <Container className="grid items-center gap-14 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:py-20">
        <div>
          <h2
            id="cabinet-title"
            className="h2 max-w-[16ch] text-[clamp(1.5rem,2.6vw,2.125rem)] text-white"
          >
            Ваши вещи под полным цифровым контролем
          </h2>

          <p className="mt-6 max-w-[44ch] text-[0.9375rem] leading-relaxed text-white/70">
            От приёма до выдачи: смотрите, на каком участке изделие прямо сейчас, храните историю
            заказов и рекомендации по уходу — с компьютера и с телефона.
          </p>

          <Link
            href="/vhod"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-teal px-6 font-display text-[0.875rem] font-bold text-white shadow-[0_10px_28px_rgba(17,184,194,0.24)] transition-[background-color,transform,box-shadow] duration-200 hover:bg-teal-hi hover:shadow-[0_12px_34px_rgba(17,184,194,0.34)] active:scale-[0.97]"
          >
            Войти в кабинет
            <IconArrow className="h-4 w-4" />
          </Link>

          <p className="mt-6 max-w-[44ch] text-[0.75rem] leading-relaxed text-white/45">
            Интерфейс показан макетом: кабинет заработает, когда его подключат к системе учёта
            заказов.
          </p>
        </div>

        <div className="pb-8 lg:pb-4">
          <CabinetMock />
        </div>
      </Container>
    </section>
  )
}
