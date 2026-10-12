import { ServiceCard } from '@/components/sections/ServiceCard'
import { Container } from '@/components/ui/Container'
import { services } from '@/lib/content'
import { dealerPage } from '@/lib/dealerPage'
import { resolvePhoto, type SiteMedia } from '@/lib/siteMediaTypes'

/** Что сдают в пункт и кто это приносит: услуги карточками главной и аудитории из стратегии. */
export function DealerMarket({ media }: { media: SiteMedia }) {
  const { accepts, audience } = dealerPage

  return (
    <section className="bg-cream">
      <Container className="py-14 lg:py-24">
        <div className="lg:flex lg:items-end lg:justify-between lg:gap-16">
          <h2 className="h2 text-[clamp(1.75rem,3.2vw,2.75rem)] text-navy">{accepts.title}</h2>
          <p className="mt-4 max-w-[46ch] text-[1.0625rem] leading-relaxed text-slate lg:mt-0 lg:pb-1">
            {accepts.text}
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {services.map((s) => (
            <li key={s.key}>
              <ServiceCard
                service={s}
                photo={resolvePhoto(media, `service.${s.key}`, { src: s.photo, alt: s.name })}
                sizes="(min-width: 1024px) 190px, (min-width: 640px) 31vw, 45vw"
              />
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-8 lg:mt-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <h2 className="h2 max-w-[12ch] text-[clamp(1.75rem,3.2vw,2.75rem)] text-balance text-navy">
            {audience.title}
          </h2>
          <dl className="border-t border-navy/12">
            {audience.items.map((a) => (
              <div
                key={a.name}
                className="grid gap-1 border-b border-navy/12 py-5 sm:grid-cols-[0.9fr_1.1fr] sm:gap-8"
              >
                <dt className="font-display text-[1.125rem] leading-snug font-bold text-navy">{a.name}</dt>
                <dd className="text-[1rem] leading-relaxed text-slate">{a.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  )
}
