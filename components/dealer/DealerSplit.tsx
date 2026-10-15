import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { IconCheck } from '@/components/ui/Icons'
import type { DealerPageContent } from '@/lib/cmsTypes'

/** Что остаётся за партнёром, что берёт «Блеск», и готовый фирменный стиль из брендбука. */
export function DealerSplit({ page }: { page: DealerPageContent }) {
  const { yours, ours, brand } = page

  return (
    <section className="bg-white">
      <Container className="py-14 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <h2 className="h2 text-[clamp(1.75rem,3.2vw,2.75rem)] text-navy">От вас</h2>
            <dl className="mt-7 border-t border-line">
              {yours.map((y) => (
                <div key={y.name} className="border-b border-line py-6">
                  <dt className="font-display text-[1.25rem] leading-snug font-bold text-navy">{y.name}</dt>
                  <dd className="mt-1.5 max-w-[44ch] text-[1rem] leading-relaxed text-slate">{y.text}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="self-start rounded-3xl bg-cream p-8 lg:p-10">
            <h2 className="h2 text-[clamp(1.75rem,3.2vw,2.75rem)] text-navy">От нас</h2>
            <ul className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {ours.map((o) => (
                <li key={o.name} className="flex gap-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal text-white">
                    <IconCheck className="h-3 w-3" />
                  </span>
                  <div>
                    <h3 className="font-display text-[1.0625rem] leading-snug font-bold text-navy">{o.name}</h3>
                    <p className="mt-1 text-[0.9375rem] leading-snug text-slate">{o.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 lg:mt-24 lg:flex lg:items-end lg:justify-between lg:gap-16">
          <h2 className="h2 text-[clamp(1.5rem,2.6vw,2rem)] text-navy">{brand.title}</h2>
          <p className="mt-3 max-w-[48ch] text-[1rem] leading-relaxed text-slate lg:mt-0">{brand.text}</p>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {brand.items.map((b) => (
            <li key={b.name}>
              <figure>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-mist">
                  <Image
                    src={b.src}
                    alt={`${b.name} — макет из брендбука`}
                    fill
                    sizes="(min-width: 1024px) 23vw, 46vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-[0.9375rem] font-semibold text-navy">{b.name}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
