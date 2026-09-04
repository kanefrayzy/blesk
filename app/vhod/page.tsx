import type { Metadata } from 'next'
import Image from 'next/image'
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
  { icon: PackageCheck, title: 'Статус заказа', text: 'Понятно, в работе вещь или уже готова к выдаче.' },
  { icon: Camera, title: 'Фото и детали', text: 'Состояние каждого изделия, загрязнения и отметки при приёмке.' },
  { icon: BellRing, title: 'Уведомления', text: 'SMS от AGBIS, а также настройки push и почты внутри кабинета.' },
]

export default function LoginPage() {
  return (
    <main className="min-h-svh bg-cream lg:grid lg:grid-cols-[minmax(380px,.82fr)_minmax(520px,1.18fr)]">
      <section className="relative hidden min-h-svh overflow-hidden bg-navy px-10 py-9 text-white lg:flex lg:flex-col xl:px-16 xl:py-12">
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

      <section className="flex min-h-svh flex-col bg-white">
        <header className="flex items-center justify-between px-5 py-5 sm:px-9 lg:px-12">
          <Link href="/" className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-slate hover:text-navy"><ChevronLeft className="h-4 w-4" /> На сайт</Link>
          <Image src="/brand/logo-h-navy.svg" alt="Блеск" width={1701} height={482} className="h-8 w-auto lg:hidden" priority />
          <span className="hidden text-[0.75rem] text-slate-soft sm:block">Защищённый вход</span>
        </header>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10 lg:px-14"><AuthForm /></div>
      </section>
    </main>
  )
}
