import Image from 'next/image'
import Link from 'next/link'
import { PageMenu } from '@/components/navigation/PageMenu'
import { Container } from '@/components/ui/Container'
import { IconUser } from '@/components/ui/Icons'
import { nav } from '@/lib/content'

/**
 * Шапка внутренних страниц.
 *
 * На главной меню живёт в плавающей полосе и ходит по якорям — за её
 * пределами якоря не работают, поэтому здесь обычная шапка со ссылками
 * на разделы главной. На телефоне разделы убраны в бургер.
 */
export function PageHeader() {
  return (
    <header className="relative z-30 bg-navy">
      <Container className="flex h-[4.5rem] items-center gap-6">
        <Link href="/" aria-label="Блеск — на главную" className="shrink-0">
          <Image
            src="/brand/logo-h-white.svg"
            alt="Блеск — профессиональная химчистка"
            width={1701}
            height={482}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav aria-label="Разделы" className="ml-auto hidden items-center lg:flex xl:gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-2.5 py-2.5 text-[0.875rem] leading-none font-bold whitespace-nowrap text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white xl:px-3.5"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/vhod"
          className="hidden h-10 shrink-0 items-center gap-2 rounded-full bg-teal px-5 font-display text-[0.8125rem] font-bold text-white transition-[background-color,transform] duration-200 hover:bg-teal-hi active:scale-[0.97] lg:inline-flex"
        >
          <IconUser className="h-4 w-4" />
          Кабинет
        </Link>

        <PageMenu />
      </Container>
    </header>
  )
}
