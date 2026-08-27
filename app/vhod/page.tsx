import type { Metadata } from 'next'
import Image from 'next/image'
import { AuthForm } from '@/components/auth/AuthForm'
import { IconArrow, IconCheck } from '@/components/ui/Icons'
import { cabinetFeatures } from '@/lib/content'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Личный кабинет',
  description:
    'Вход и регистрация в личном кабинете химчистки «Блеск»: история заказов, статус изделия, ' +
    'стоимость, фотографии при приёмке и рекомендации по уходу.',
  alternates: { canonical: '/vhod' },
  openGraph: {
    url: `${SITE_URL}/vhod`,
    title: 'Личный кабинет — Химчистка «Блеск»',
    description: 'История заказов, статус изделия и рекомендации по уходу в одном месте.',
  },
}

export default function Page() {
  return (
    <main className="lg:grid lg:min-h-svh lg:grid-cols-[0.92fr_1fr]">
      {/* ---------------------------------------- левая: смысл кабинета */}
      <section className="relative flex flex-col bg-navy">
        <div className="relative h-[30svh] min-h-[200px] w-full lg:absolute lg:inset-0 lg:h-full lg:min-h-0">
          <Image
            src="/photo/cabinet-desk.jpg"
            alt="Сотрудница «Блеска» оформляет заказ на приёмном пункте"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 47vw"
            quality={90}
            className="object-cover object-[58%_22%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-navy via-navy/25 to-transparent lg:from-navy lg:via-navy/62 lg:to-navy/15"
          />
        </div>

        <div className="relative flex flex-1 flex-col px-6 pt-8 pb-10 lg:px-12 lg:pt-10 lg:pb-14">
          <a href="/" aria-label="Блеск — на главную" className="w-fit">
            <Image
              src="/brand/logo-h-white.svg"
              alt="Блеск — профессиональная химчистка"
              width={1701}
              height={482}
              className="h-9 w-auto lg:h-11"
            />
          </a>

          <div className="mt-10 lg:mt-auto lg:pt-16">
            <p className="label text-teal">Личный кабинет</p>
            <h1 className="h2 mt-4 max-w-[18ch] text-[clamp(1.5rem,2.6vw,2.125rem)] text-white">
              Ваши вещи под полным цифровым контролем
            </h1>

            <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-y-3.5">
              {cabinetFeatures.map((f) => (
                <li key={f.name} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/15">
                    <IconCheck className="h-3 w-3 text-teal" />
                  </span>
                  <span className="min-w-0">
                    <b className="font-display text-[0.9375rem] leading-tight font-semibold text-white">
                      {f.name}
                    </b>
                    {'soon' in f && f.soon && (
                      <span className="ml-2 rounded border border-dashed border-white/30 px-1.5 py-0.5 align-[0.15em] text-[0.5625rem] leading-none tracking-wider text-white/60 uppercase">
                        В перспективе
                      </span>
                    )}
                    <span className="mt-1 block text-[0.8125rem] leading-snug text-white/60">
                      {f.note}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-8 max-w-[46ch] text-[0.75rem] leading-relaxed text-white/60">
              Состав кабинета — из стратегии проекта. Он появится, когда «Блеск» подключит его к
              своей системе учёта заказов.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ правая: форма */}
      <section className="flex flex-col items-center justify-center bg-white px-5 py-14 lg:px-12">
        <AuthForm />

        <a
          href="/"
          className="mt-10 inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-slate transition-colors hover:text-teal lg:hidden"
        >
          <IconArrow className="h-4 w-4 rotate-180" />
          На главную
        </a>
      </section>
    </main>
  )
}
