import { ServiceCard } from '@/components/sections/ServiceCard'
import { Container } from '@/components/ui/Container'
import { services } from '@/lib/content'
import { resolvePhoto, type SiteMedia } from '@/lib/siteMediaTypes'

/** Остальные услуги теми же карточками, что в ленте на главной. */
export function OtherServices({ current, media }: { current: string; media: SiteMedia }) {
  return (
    <section className="bg-white">
      <Container className="py-14 lg:py-20">
        <h2 className="h2 text-[clamp(1.5rem,2.6vw,2rem)] text-navy">Другие услуги</h2>
        <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {services
            .filter((s) => s.key !== current)
            .map((s) => (
              <li key={s.key}>
                <ServiceCard
                  service={s}
                  photo={resolvePhoto(media, `service.${s.key}`, { src: s.photo, alt: s.name })}
                  sizes="(min-width: 1024px) 230px, (min-width: 640px) 31vw, 45vw"
                />
              </li>
            ))}
        </ul>
      </Container>
    </section>
  )
}
