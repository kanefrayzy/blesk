import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { IconCheck } from '@/components/ui/Icons'
import type { ServicePage } from '@/lib/servicePages'

type Props = {
  page: ServicePage
  /** Кадр из блока производства и его подпись. */
  shop: { src: string; alt: string; name: string; note: string }
}

export function ServiceProcess({ page, shop }: Props) {
  return (
    <section className="bg-navy">
      <Container className="py-14 lg:py-20">
        <h2 className="h2 text-[clamp(1.75rem,3.2vw,2.75rem)] text-white">Что делаем мы</h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <figure className="relative flex aspect-[4/3] overflow-hidden rounded-3xl lg:aspect-[5/5.4]">
            <Image
              src={shop.src}
              alt={shop.alt}
              fill
              sizes="(min-width: 1024px) 42vw, 92vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-navy via-navy/35 to-transparent"
            />
            <figcaption className="relative mt-auto p-6 lg:p-8">
              <span className="block font-display text-[clamp(1.125rem,1.6vw,1.375rem)] font-bold text-white">
                {shop.name}
              </span>
              <span className="mt-1 block text-[0.875rem] text-white/75">{shop.note}</span>
            </figcaption>
          </figure>

          <ol>
            {page.steps.map((s, i) => (
              <li key={s.name} className="group relative flex gap-5 pb-8 last:pb-0 lg:gap-6 lg:pb-9">
                {/* Линия пути между шагами */}
                <span
                  aria-hidden="true"
                  className="absolute top-12 bottom-1 left-[1.3125rem] w-px bg-white/15 group-last:hidden"
                />
                <span className="flex h-[2.625rem] w-[2.625rem] shrink-0 items-center justify-center rounded-full bg-white/8 font-display text-[0.8125rem] font-bold text-teal tabular-nums ring-1 ring-white/15">
                  {i + 1}
                </span>
                <div className="pt-1.5">
                  <h3 className="font-display text-[clamp(1.125rem,1.5vw,1.3125rem)] leading-snug font-bold text-white">
                    {s.name}
                  </h3>
                  <p className="mt-1.5 max-w-[46ch] text-[0.9375rem] leading-relaxed text-white/65">
                    {s.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-12 flex items-center gap-4 rounded-3xl bg-white/6 p-6 ring-1 ring-white/10 sm:gap-5 sm:p-8 lg:mt-16">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal text-white">
            <IconCheck className="h-5 w-5" />
          </span>
          <p className="max-w-[58ch] font-display text-[clamp(1.0625rem,1.7vw,1.4375rem)] leading-snug font-bold text-white">
            {page.result}
          </p>
        </div>
      </Container>
    </section>
  )
}
