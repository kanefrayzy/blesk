import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SkipLink } from '@/components/layout/SkipLink'
import { TrackedPhoneLink } from '@/components/metrics/TrackedPhoneLink'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { Container } from '@/components/ui/Container'
import { IconArrow, IconCheck } from '@/components/ui/Icons'
import { heroSlides, org, services } from '@/lib/content'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import { priceFactors, servicePages } from '@/lib/servicePages'
import { getSiteMedia } from '@/lib/siteMedia'
import { resolvePhoto } from '@/lib/siteMediaTypes'

type Params = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return servicePages.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const page = servicePages.find((p) => p.slug === slug)
  if (!page) return {}

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: `/uslugi/${page.slug}` },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/uslugi/${page.slug}`,
      title: page.seoTitle,
      description: page.seoDescription,
      images: [{ url: `${SITE_URL}/photo/hero-${page.key}.jpg` }],
    },
  }
}

const CTA =
  'inline-flex h-12 items-center justify-center gap-2 rounded-full bg-teal px-6 font-display text-[0.8125rem] font-extrabold tracking-wide whitespace-nowrap text-white uppercase shadow-[0_8px_20px_rgba(17,184,194,0.22)] transition-[background-color,transform,box-shadow] duration-200 hover:bg-teal-hi hover:shadow-[0_10px_26px_rgba(17,184,194,0.32)] active:scale-[0.97]'

export default async function ServicePage({ params }: Params) {
  const { slug } = await params
  const page = servicePages.find((p) => p.slug === slug)
  if (!page) notFound()

  const service = services.find((s) => s.key === page.key)!
  const slide = heroSlides.find((s) => s.key === page.key)!
  const media = await getSiteMedia()
  const photo = resolvePhoto(media, `hero.${page.key}`, { src: slide.photo, alt: slide.alt })
  const others = servicePages.filter((p) => p.key !== page.key)

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${SITE_URL}/uslugi/${page.slug}#service`,
        name: page.title,
        description: page.seoDescription,
        serviceType: service.name,
        url: `${SITE_URL}/uslugi/${page.slug}`,
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: { '@type': 'City', name: org.city },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Услуги', item: `${SITE_URL}/#uslugi` },
          { '@type': 'ListItem', position: 3, name: service.name },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
      />

      <SkipLink href="#main" />
      <PageHeader />

      <main id="main">
        <section className="bg-navy">
          <Container className="grid gap-10 pt-10 pb-14 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:gap-14 lg:pt-14 lg:pb-20">
            <div>
              <nav aria-label="Хлебные крошки" className="rise-in text-[0.75rem] text-white/50">
                <Link href="/#uslugi" className="transition-colors hover:text-teal">
                  Услуги
                </Link>
                <span aria-hidden="true" className="mx-2 text-white/25">
                  /
                </span>
                <span className="text-white/70">{service.name}</span>
              </nav>

              <h1
                className="h2 rise-in mt-5 max-w-[18ch] text-[clamp(1.875rem,3.8vw,3rem)] text-white"
                style={{ animationDelay: '60ms' }}
              >
                {page.title}
              </h1>

              <p
                className="rise-in mt-5 max-w-[46ch] text-[1.0625rem] leading-relaxed text-white/75"
                style={{ animationDelay: '120ms' }}
              >
                {page.lead}
              </p>

              <div
                className="rise-in mt-8 flex flex-wrap items-center gap-x-8 gap-y-5"
                style={{ animationDelay: '180ms' }}
              >
                <p>
                  {page.price && (
                    <span className="block font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-none font-bold text-teal tabular-nums">
                      {page.price}
                    </span>
                  )}
                  <span
                    className={
                      page.price
                        ? 'mt-2 block text-[0.8125rem] text-white/55'
                        : 'block font-display text-[1.125rem] font-bold text-teal'
                    }
                  >
                    {page.priceNote}
                  </span>
                </p>

                <a href="/#zapis" className={CTA}>
                  {page.cta}
                  <IconArrow className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div
              className="rise-in relative aspect-[4/3] overflow-hidden rounded-3xl bg-navy-2"
              style={{ animationDelay: '120ms' }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                priority
                quality={90}
                sizes="(min-width: 1024px) 46vw, 92vw"
                className="object-cover"
              />
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="grid gap-8 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-20">
            <h2 className="h2 max-w-[14ch] text-[clamp(1.5rem,2.6vw,2rem)] text-navy">
              {page.risk.title}
            </h2>
            <div className="max-w-[60ch] space-y-5 text-[1.0625rem] leading-relaxed text-slate">
              {page.risk.text.map((t, i) => (
                <p key={t} className={i === page.risk.text.length - 1 ? 'font-medium text-navy' : ''}>
                  {t}
                </p>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-cream">
          <Container className="py-14 lg:py-20">
            <h2 className="h2 text-[clamp(1.5rem,2.6vw,2rem)] text-navy">Что делаем мы</h2>

            <ol className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {page.steps.map((s, i) => (
                <li key={s.name} className="border-t border-navy/12 pt-5">
                  <span className="font-display text-[0.75rem] leading-none font-extrabold tracking-[0.2em] text-teal tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 font-display text-[1.0625rem] leading-snug font-bold text-navy">
                    {s.name}
                  </h3>
                  <p className="mt-2 max-w-[38ch] text-[0.9375rem] leading-relaxed text-slate">
                    {s.text}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-12 flex items-start gap-4 rounded-3xl bg-white p-6 shadow-[0_18px_44px_rgba(14,26,53,0.08)] sm:p-8">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                <IconCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="label text-teal">Что вы получаете</h2>
                <p className="mt-3 max-w-[58ch] font-display text-[clamp(1.0625rem,1.6vw,1.3125rem)] leading-snug font-bold text-navy">
                  {page.result}
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-20">
            <div>
              <h2 className="h2 text-[clamp(1.5rem,2.6vw,2rem)] text-navy">Сколько стоит</h2>

              {page.prices.length > 0 && (
                <dl className="mt-8 border-t border-line">
                  {page.prices.map((p) => (
                    <div
                      key={p.item}
                      className="flex items-baseline justify-between gap-6 border-b border-line py-4"
                    >
                      <dt className="text-[0.9375rem] text-navy">{p.item}</dt>
                      <dd className="shrink-0 font-display text-[1rem] font-bold text-navy tabular-nums">
                        {p.price}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              <p className="mt-6 max-w-[58ch] text-[0.9375rem] leading-relaxed text-slate">
                {page.priceText}
              </p>

              <a href="/#zapis" className={`${CTA} mt-8`}>
                {page.cta}
                <IconArrow className="h-4 w-4" />
              </a>
            </div>

            <div className="rounded-3xl bg-cream p-6 sm:p-8">
              <h3 className="font-display text-[1.0625rem] font-bold text-navy">
                От чего зависит цена
              </h3>
              <ul className="mt-5 space-y-4">
                {priceFactors.map((f) => (
                  <li key={f.name} className="flex gap-3">
                    <IconCheck className="mt-1 h-4 w-4 shrink-0 text-teal" />
                    <p className="text-[0.9375rem] leading-snug text-slate">
                      <span className="font-semibold text-navy">{f.name}.</span> {f.text}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-navy/10 pt-5 text-[0.8125rem] leading-relaxed text-slate">
                Точную цену приёмщик называет при осмотре, до оформления заказа.
              </p>
            </div>
          </Container>
        </section>

        <section className="bg-navy">
          <Container className="flex flex-col gap-8 py-14 lg:flex-row lg:items-center lg:justify-between lg:py-16">
            <div>
              <h2 className="h2 max-w-[22ch] text-[clamp(1.5rem,2.6vw,2rem)] text-white">
                Расскажите о вещи — посчитаем заранее
              </h2>
              <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-relaxed text-white/65">
                Заявка бесплатна и ни к чему не обязывает. Менеджер свяжется с вами и подтвердит
                стоимость.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
              <a href="/#zapis" className={CTA}>
                Оставить заявку
                <IconArrow className="h-4 w-4" />
              </a>
              <p>
                <span className="block text-[0.75rem] text-white/45">Или по телефону</span>
                <TrackedPhoneLink
                  href={org.phones[0].href}
                  className="mt-1 inline-block font-display text-[1.125rem] font-bold text-white transition-colors hover:text-teal"
                >
                  {org.phones[0].display}
                </TrackedPhoneLink>
              </p>
            </div>
          </Container>
        </section>

        <section className="bg-cream">
          <Container className="py-14 lg:py-16">
            <h2 className="h2 text-[1.25rem] text-navy">Другие услуги</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {others.map((o) => {
                const s = services.find((x) => x.key === o.key)!
                return (
                  <li key={o.slug}>
                    <Link
                      href={`/uslugi/${o.slug}`}
                      className="group flex h-full items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-navy/5 transition-shadow duration-200 hover:shadow-[0_12px_30px_rgba(14,26,53,0.1)]"
                    >
                      <BrandIcon name={s.icon} className="h-8 w-8 shrink-0" />
                      <span className="font-display text-[0.9375rem] leading-snug font-bold text-navy transition-colors group-hover:text-teal">
                        {s.name}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
