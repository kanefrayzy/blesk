import type { Metadata } from 'next'
import Image, { getImageProps } from 'next/image'
import { AuthForm } from '@/components/auth/AuthForm'
import { IconArrow, IconCheck } from '@/components/ui/Icons'
import { cabinetFeatures } from '@/lib/content'
import { SITE_URL } from '@/lib/seo'
import Link from 'next/link'

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

const PHOTO_ALT =
  'Клиентка в машине с телефоном в руке: на экране уведомление «Блеска» о готовом заказе'

/**
 * Кадр в двух кропах. Полоса под фотографию на десктопе шире мобильной почти
 * вдвое, и один кадр не годится обоим: на телефоне уведомление на экране
 * съёживается до нечитаемого. Мобильный кроп плотнее — только сам телефон.
 * Источник выбирает браузер, грузится ровно один.
 */
function PhotoSources() {
  const {
    props: { srcSet: wide },
  } = getImageProps({
    alt: PHOTO_ALT,
    src: '/photo/cabinet-push.jpg',
    width: 1180,
    height: 694,
    sizes: '47vw',
    quality: 88,
  })
  const {
    props: { srcSet: tight, ...rest },
  } = getImageProps({
    alt: PHOTO_ALT,
    src: '/photo/cabinet-push-m.jpg',
    width: 1152,
    height: 800,
    sizes: '100vw',
    quality: 82,
  })

  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={wide} sizes="47vw" />
      <source srcSet={tight} sizes="100vw" />
      <img
        {...rest}
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </picture>
  )
}

export default function Page() {
  return (
    <main className="lg:grid lg:min-h-svh lg:grid-cols-[0.92fr_1fr]">
      {/* ---------------------------------------- левая: смысл кабинета */}
      <section className="relative flex flex-col bg-navy">
        {/* Кадр занимает верх панели, а не лежит под текстом: уведомление на
            экране телефона должно читаться, а не тонуть под списком. */}
        <div className="relative h-[32svh] min-h-[210px] w-full shrink-0 lg:h-[40svh]">
          <PhotoSources />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-navy/70 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy to-transparent"
          />

          <Link
            href="/"
            aria-label="Блеск — на главную"
            className="absolute top-6 left-6 lg:top-8 lg:left-12"
          >
            <Image
              src="/brand/logo-h-white.svg"
              alt="Блеск — профессиональная химчистка"
              width={1701}
              height={482}
              className="h-9 w-auto lg:h-11"
            />
          </Link>
        </div>

        <div className="relative flex flex-1 flex-col px-6 pt-8 pb-10 lg:px-12 lg:pt-10 lg:pb-14">
          <div className="lg:mt-auto">
            <p className="label text-teal">Личный кабинет</p>
            <h1 className="h2 mt-4 max-w-[18ch] text-[clamp(1.5rem,2.6vw,2.125rem)] text-white">
              Ваши вещи под полным цифровым контролем
            </h1>

            <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-y-3">
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

          </div>
        </div>
      </section>

      {/* ------------------------------------------------ правая: форма */}
      <section className="flex flex-col items-center justify-center bg-white px-5 py-14 lg:px-12">
        <AuthForm />

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-slate transition-colors hover:text-teal lg:hidden"
        >
          <IconArrow className="h-4 w-4 rotate-180" />
          На главную
        </Link>
      </section>
    </main>
  )
}
