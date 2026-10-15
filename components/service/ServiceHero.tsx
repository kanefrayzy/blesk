import Image from 'next/image'
import Link from 'next/link'
import { ServiceButton } from '@/components/service/ServiceButton'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { Container } from '@/components/ui/Container'
import type { CmsService } from '@/lib/cmsTypes'

type Props = {
  page: CmsService
  photo: { src: string; alt: string }
}

export function ServiceHero({ page, photo }: Props) {
  return (
    <section className="relative overflow-hidden bg-navy">
      {/* То же кольцо, что в блоке онлайн-заявки */}
      <div
        aria-hidden="true"
        className="absolute -right-32 -bottom-40 hidden h-[30rem] w-[30rem] rounded-full border-[88px] border-teal/10 lg:block"
      />

      <Container className="relative grid gap-12 pt-10 pb-16 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:gap-14 lg:pt-14 lg:pb-20">
        <div>
          <nav aria-label="Хлебные крошки" className="rise-in text-[0.75rem] text-white/50">
            <Link href="/#uslugi" className="transition-colors hover:text-teal">
              Услуги
            </Link>
            <span aria-hidden="true" className="mx-2 text-white/25">
              /
            </span>
            <span className="text-white/70">{page.name}</span>
          </nav>

          <h1
            className="h2 rise-in mt-5 max-w-[18ch] text-[clamp(1.875rem,3.8vw,3rem)] text-balance text-white"
            style={{ animationDelay: '60ms' }}
          >
            {page.title}
          </h1>

          <p
            className="rise-in mt-5 max-w-[44ch] text-[1.0625rem] leading-relaxed text-white/75"
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

            <ServiceButton>{page.cta}</ServiceButton>
          </div>
        </div>

        <div className="rise-in relative" style={{ animationDelay: '120ms' }}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-navy-2">
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
          {/* Иконка услуги, как на карточках главной */}
          <span className="absolute -bottom-6 left-8 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_6px_18px_rgba(14,26,53,0.2)] ring-4 ring-navy">
            <BrandIcon name={page.icon} className="h-9 w-9" />
          </span>
        </div>
      </Container>
    </section>
  )
}
