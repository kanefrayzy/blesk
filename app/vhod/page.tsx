import type { Metadata } from 'next'
import Image, { getImageProps } from 'next/image'
import Link from 'next/link'
import { BellRing, Camera, ChevronLeft, PackageCheck } from 'lucide-react'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata: Metadata = {
  title: 'Вход в личный кабинет',
  description: 'Вход в личный кабинет химчистки «Блеск» по номеру телефона.',
  alternates: { canonical: '/vhod' },
  robots: { index: false, follow: false },
}

const advantages = [
  { icon: PackageCheck, title: 'Статус заказа', text: 'Сразу видно, какие вещи в работе и что уже можно забирать.' },
  { icon: Camera, title: 'Фотопротокол', text: 'Фотографии и отметки по каждому изделию в заказе.' },
  { icon: BellRing, title: 'Уведомления', text: 'Сообщим, когда статус заказа изменится.' },
]

const photoAlt = 'Клиентка получает на телефон уведомление химчистки «Блеск» о готовом заказе'

function LoginPhoto() {
  const {
    props: { srcSet: desktop },
  } = getImageProps({
    alt: photoAlt,
    src: '/photo/cabinet-push.jpg',
    width: 1180,
    height: 694,
    sizes: '46vw',
    quality: 88,
  })
  const {
    props: { srcSet: mobile, ...imageProps },
  } = getImageProps({
    alt: photoAlt,
    src: '/photo/cabinet-push-m.jpg',
    width: 1152,
    height: 800,
    sizes: '100vw',
    quality: 84,
  })

  return (
    <picture>
      <source media="(min-width: 1280px)" srcSet={desktop} sizes="46vw" />
      <img {...imageProps} srcSet={mobile} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-center" />
    </picture>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-svh bg-navy xl:grid xl:grid-cols-[minmax(430px,.9fr)_minmax(560px,1.1fr)]">
      <section className="relative flex flex-col bg-navy text-white xl:min-h-svh">
        <div className="relative h-[32svh] min-h-[230px] shrink-0 overflow-hidden sm:h-[38svh] xl:h-[44svh]">
          <LoginPhoto />
          <div aria-hidden className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-navy/75 to-transparent" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-navy to-transparent" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 xl:px-12 xl:pt-9">
            <Link href="/" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-navy/45 px-3 text-[0.75rem] font-semibold text-white backdrop-blur-md transition hover:bg-navy/65"><ChevronLeft className="h-4 w-4" /> На сайт</Link>
            <Image src="/brand/logo-h-white.svg" alt="Блеск" width={1701} height={482} className="h-8 w-auto xl:h-10" priority />
          </div>
        </div>

        <div className="relative px-5 pt-3 pb-10 sm:px-8 sm:pt-5 xl:flex xl:flex-1 xl:flex-col xl:px-12 xl:pt-8 xl:pb-12">
          <div className="xl:my-auto">
            <p className="label text-teal">Личный кабинет</p>
            <h2 className="mt-3 max-w-[18ch] font-display text-[2rem] leading-[1.04] font-bold tracking-[-.04em] sm:text-[2.5rem] xl:text-[2.8rem]">Всё о ваших вещах — рядом</h2>
            <p className="mt-3 max-w-[36rem] text-[0.875rem] leading-relaxed text-white/60 sm:text-[0.9375rem]">Статус заказа, фотографии и запись в химчистку — в одном месте.</p>

            <div className="mt-7 hidden gap-3 xl:grid">
              {advantages.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.045] p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal/15 text-teal"><Icon className="h-5 w-5" /></span>
                  <div><p className="font-display text-[0.9375rem] font-bold">{title}</p><p className="mt-0.5 text-[0.8125rem] leading-snug text-white/52">{text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-5 flex min-h-[36rem] items-start justify-center rounded-t-[2rem] bg-white px-5 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] shadow-[0_-18px_60px_rgba(0,0,0,.15)] sm:mx-auto sm:mb-8 sm:w-[calc(100%-3rem)] sm:max-w-[38rem] sm:rounded-[2rem] sm:px-10 sm:py-10 xl:my-0 xl:min-h-svh xl:w-full xl:max-w-none xl:items-center xl:rounded-none xl:px-14 xl:py-12 xl:shadow-none">
        <AuthForm />
      </section>
    </main>
  )
}
