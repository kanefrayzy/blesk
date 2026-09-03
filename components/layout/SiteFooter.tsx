import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { IconTelegram, IconVk } from '@/components/ui/Icons'
import { TrackedPhoneLink } from '@/components/metrics/TrackedPhoneLink'
import { org, footerLinks } from '@/lib/content'

export function SiteFooter() {
  return (
    <footer className="bg-navy">
      <Container className="grid gap-10 py-14 lg:grid-cols-[1fr_2fr_1fr] lg:gap-12">
        <div>
          <Image
            src="/brand/logo-h-white.svg"
            alt="Блеск — профессиональная химчистка"
            width={1701}
            height={482}
            className="h-11 w-auto"
          />
          <p className="mt-5 text-[0.75rem] leading-relaxed text-white/50">
            Химчистка «Блеск»
            <br />
            {org.region}, г.&nbsp;{org.city}, {org.street}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {footerLinks.map((col) => (
            <div key={col.title}>
              <p className="label text-white/45">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((it) => (
                  <li key={it.label}>
                    <Link
                      href={it.href}
                      className="text-[0.8125rem] text-white/75 transition-colors hover:text-teal"
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="lg:text-right">
          {org.phones.map((p) => (
            <TrackedPhoneLink
              key={p.href}
              href={p.href}
              className="block font-display text-[1.0625rem] font-bold text-white tabular-nums transition-colors hover:text-teal"
            >
              {p.display}
            </TrackedPhoneLink>
          ))}
          <a
            href={`mailto:${org.email}`}
            className="mt-2 block text-[0.8125rem] text-white/70 transition-colors hover:text-teal"
          >
            {org.email}
          </a>
          <p className="mt-2 text-[0.75rem] text-white/60">
            Часы работы <span className="tabular-nums">{org.hours}</span>
          </p>

          <div className="mt-5 flex gap-2.5 lg:justify-end">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/70">
              <IconTelegram className="h-4.5 w-4.5" />
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/70">
              <IconVk className="h-4.5 w-4.5" />
            </span>
          </div>

          <Button
            nativeButton={false}
            render={<a href="/#zapis" />}
            className="mt-6 h-11 rounded-full px-6 text-[0.8125rem] tracking-wide uppercase hover:bg-teal-hi"
          >
            Заказать онлайн
          </Button>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.75rem] text-white/40">© Химчистка «Блеск». {org.site}</p>
          <div className="flex flex-col gap-2 text-[0.75rem] sm:flex-row sm:gap-5">
            <Link
              href="/politika-obrabotki-personalnyh-dannyh"
              className="text-white/50 transition-colors hover:text-white"
            >
              Политика обработки данных
            </Link>
            <Link
              href="/soglasie-na-obrabotku-personalnyh-dannyh"
              className="text-white/50 transition-colors hover:text-white"
            >
              Согласие на обработку данных
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  )
}
