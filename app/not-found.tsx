import type { Metadata } from 'next'
import Image from 'next/image'
import { IconArrow } from '@/components/ui/Icons'
import { org } from '@/lib/content'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Страница не найдена',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-navy px-5 text-center">
      <Image
        src="/brand/logo-h-white.svg"
        alt="Блеск — профессиональная химчистка"
        width={1701}
        height={482}
        className="h-12 w-auto"
      />

      <p className="mt-12 font-display text-[clamp(3rem,10vw,5rem)] leading-none font-extrabold text-teal">
        404
      </p>
      <h1 className="h2 mt-4 text-[clamp(1.25rem,4vw,1.75rem)] text-white">Страница не найдена</h1>
      <p className="mt-4 max-w-[38ch] text-[0.9375rem] leading-relaxed text-white/70">
        Возможно, адрес набран с опечаткой или страница переехала. Вернитесь на главную или
        позвоните — подскажем.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-teal px-6 font-display text-[0.875rem] font-bold text-white transition-[background-color,transform] duration-200 hover:bg-teal-hi active:scale-[0.97]"
        >
          На главную
          <IconArrow className="h-4 w-4" />
        </Link>
        <a
          href={org.phones[0].href}
          className="inline-flex h-12 items-center rounded-full border border-white/35 px-6 font-display text-[0.875rem] font-bold text-white transition-[background-color,border-color,transform] duration-200 hover:border-white hover:bg-white/10 active:scale-[0.97]"
        >
          {org.phones[0].display}
        </a>
      </div>
    </main>
  )
}
