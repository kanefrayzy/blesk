import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { BellRing, Camera, ChevronLeft, PackageCheck, ShieldCheck } from 'lucide-react'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata: Metadata = {
  title: 'Вход в личный кабинет',
  description: 'Вход в личный кабинет химчистки «Блеск» по номеру телефона.',
  alternates: { canonical: '/vhod' },
  robots: { index: false, follow: false },
}

const advantages = [
  { icon: PackageCheck, title: 'Статус заказа', text: 'Понятно, в работе вещь или уже готова к выдаче.' },
  { icon: Camera, title: 'Фото и детали', text: 'Состояние каждого изделия, загрязнения и отметки при приёмке.' },
  { icon: BellRing, title: 'Уведомления', text: 'SMS от AGBIS, а также настройки push и почты внутри кабинета.' },
]

export default function LoginPage() {
  return (
    <main className="min-h-svh bg-navy xl:grid xl:grid-cols-[minmax(400px,.84fr)_minmax(560px,1.16fr)]">
      <section className="relative hidden min-h-svh overflow-hidden bg-navy px-10 py-9 text-white xl:flex xl:flex-col xl:px-16 xl:py-12">
        <div aria-hidden className="absolute top-0 right-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full border border-white/10" />
        <div aria-hidden className="absolute top-10 right-10 h-40 w-40 rounded-full border border-teal/30" />
        <Link href="/" className="relative inline-flex w-fit items-center gap-3" aria-label="На главную">
          <Image src="/brand/logo-h-white.svg" alt="Блеск" width={1701} height={482} className="h-10 w-auto" priority />
        </Link>

        <div className="relative my-auto max-w-[33rem] py-14">
          <p className="label text-teal">Всё о заказе — рядом</p>
          <h2 className="mt-5 font-display text-[clamp(2.2rem,4.1vw,4.5rem)] leading-[.98] font-bold tracking-[-.045em]">Ваши вещи<br />под контролем</h2>
          <p className="mt-6 max-w-[36ch] text-[1rem] leading-relaxed text-white/62">Один аккуратный кабинет вместо звонков: текущий заказ, отдельные позиции, фотографии и история обращений.</p>

          <div className="mt-12 grid gap-3">
            {advantages.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.045] p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal/15 text-teal"><Icon className="h-5 w-5" /></span>
                <div><p className="font-display text-[0.9375rem] font-bold">{title}</p><p className="mt-0.5 text-[0.8125rem] leading-snug text-white/52">{text}</p></div>
                <span className="ml-auto text-[0.6875rem] font-semibold text-white/25">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[0.75rem] text-white/35">Химчистка «Блеск» · Жуковский</p>
      </section>

      <section className="relative flex min-h-svh flex-col overflow-hidden bg-navy xl:bg-white">
        <div aria-hidden className="absolute -top-20 -right-20 h-64 w-64 rounded-full border border-white/10 xl:hidden" />
        <div aria-hidden className="absolute top-8 right-8 h-32 w-32 rounded-full border border-teal/30 xl:hidden" />

        <header className="relative z-10 flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sm:px-8 xl:px-12 xl:pt-7">
          <Link href="/" className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/12 bg-white/7 px-3 text-[0.75rem] font-semibold text-white/75 backdrop-blur transition hover:bg-white/12 hover:text-white xl:border-0 xl:bg-transparent xl:px-0 xl:text-slate xl:hover:bg-transparent xl:hover:text-navy"><ChevronLeft className="h-4 w-4" /> На сайт</Link>
          <Image src="/brand/logo-h-white.svg" alt="Блеск" width={1701} height={482} className="h-8 w-auto xl:hidden" priority />
          <span className="hidden items-center gap-2 text-[0.75rem] text-slate-soft xl:flex"><ShieldCheck className="h-4 w-4 text-teal" /> Защищённый вход</span>
        </header>

        <div className="relative z-10 px-5 pt-6 pb-8 text-white sm:mx-auto sm:w-full sm:max-w-[36rem] sm:px-8 sm:pt-10 xl:hidden">
          <p className="label text-teal">Личный кабинет</p>
          <h2 className="mt-3 max-w-[18ch] font-display text-[2rem] leading-[1.04] font-bold tracking-[-.04em] sm:text-[2.75rem]">Всё о ваших вещах — в одном месте</h2>
          <p className="mt-3 max-w-[34rem] text-[0.875rem] leading-relaxed text-white/58 sm:text-[0.9375rem]">Статус заказа, фотографии и история — без лишних звонков.</p>
        </div>

        <div className="relative z-10 flex flex-1 items-start justify-center rounded-t-[2rem] bg-white px-5 pt-7 pb-[max(2rem,env(safe-area-inset-bottom))] shadow-[0_-18px_60px_rgba(0,0,0,.12)] sm:mx-auto sm:mb-8 sm:w-[calc(100%-3rem)] sm:max-w-[36rem] sm:flex-none sm:rounded-[2rem] sm:px-10 sm:py-10 xl:my-auto xl:w-full xl:max-w-none xl:flex-1 xl:items-center xl:rounded-none xl:px-14 xl:py-12 xl:shadow-none">
          <AuthForm />
        </div>
      </section>
    </main>
  )
}
