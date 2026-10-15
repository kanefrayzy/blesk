import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { IconArrow } from '@/components/ui/Icons'
import type { DealerPageContent } from '@/lib/cmsTypes'

// Кольцо в координатах 1200×440: слева пункт, справа цех, по часовой стрелке.
const RING = 'M150 220A150 150 0 0 1 300 70H900A150 150 0 0 1 900 370H300A150 150 0 0 1 150 220Z'

const pill =
  'inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-[0.9375rem] leading-none font-bold whitespace-nowrap text-navy shadow-[0_6px_18px_rgba(14,26,53,0.08)]'

function Place({ photo, alt, className }: { photo: string; alt: string; className: string }) {
  return (
    <div className={`aspect-square overflow-hidden rounded-full bg-mist ring-[6px] ring-white ${className}`}>
      <Image src={photo} alt={alt} fill sizes="200px" className="object-cover" />
    </div>
  )
}

/** Путь вещи кольцом: пункт партнёра и цех «Блеска», между ними ежедневный рейс. */
export function DealerLoop({ page }: { page: DealerPageContent }) {
  const { loop } = page

  return (
    <section id="kak" className="scroll-mt-20 bg-cream">
      <Container className="py-14 lg:py-24">
        <div className="mx-auto max-w-[40rem] text-center">
          <h2 className="h2 text-[clamp(1.75rem,3.2vw,2.75rem)] text-navy">{loop.title}</h2>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-slate">{loop.text}</p>
        </div>

        <div className="relative mx-auto mt-14 hidden aspect-[1200/440] max-w-[1100px] lg:block">
          <svg viewBox="0 0 1200 440" className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
            <path d={RING} fill="none" stroke="#14A4AF" strokeOpacity="0.75" strokeWidth="3" strokeDasharray="1 12" strokeLinecap="round" />
            <circle r="9" fill="#14A4AF" stroke="#FFFFFF" strokeWidth="4" className="motion-reduce:hidden">
              <animateMotion dur="18s" repeatCount="indefinite" path={RING} />
            </circle>
          </svg>

          <Place
            photo={loop.point.photo}
            alt={loop.point.alt}
            className="absolute top-1/2 left-[12.5%] w-[17%] -translate-x-1/2 -translate-y-1/2 shadow-[0_14px_34px_rgba(14,26,53,0.14)]"
          />
          <div className="absolute top-1/2 left-[23.5%] w-[19%] -translate-y-1/2">
            <h3 className="font-display text-[1.375rem] leading-snug font-bold text-navy">{loop.point.name}</h3>
            <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-slate">{loop.point.text}</p>
          </div>

          <div className="absolute top-1/2 right-[23.5%] w-[19%] -translate-y-1/2 text-right">
            <h3 className="font-display text-[1.375rem] leading-snug font-bold text-navy">{loop.shop.name}</h3>
            <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-slate">{loop.shop.text}</p>
          </div>
          <Place
            photo={loop.shop.photo}
            alt={loop.shop.alt}
            className="absolute top-1/2 left-[87.5%] w-[17%] -translate-x-1/2 -translate-y-1/2 shadow-[0_14px_34px_rgba(14,26,53,0.14)]"
          />

          <p className={`${pill} absolute top-[15.9%] left-1/2 -translate-x-1/2 -translate-y-1/2`}>
            {loop.there}
            <IconArrow className="h-4 w-4 text-teal" />
          </p>
          <p className={`${pill} absolute top-[84.1%] left-1/2 -translate-x-1/2 -translate-y-1/2`}>
            <IconArrow className="h-4 w-4 rotate-180 text-teal" />
            {loop.back}
          </p>
        </div>

        {/* На телефоне кольцо не помещается — тот же путь столбиком */}
        <ol className="mt-10 lg:hidden">
          {[
            { place: loop.point, way: loop.there },
            { place: loop.shop, way: loop.back },
            { place: loop.point, way: null },
          ].map(({ place, way }, i) => (
            <li key={i}>
              <div className="flex items-center gap-4">
                <Place photo={place.photo} alt={place.alt} className="relative w-20 shrink-0" />
                <div>
                  <h3 className="font-display text-[1.1875rem] leading-snug font-bold text-navy">{place.name}</h3>
                  <p className="mt-1 text-[0.9375rem] leading-snug text-slate">{place.text}</p>
                </div>
              </div>
              {way && (
                <p className="my-3 ml-10 flex items-center gap-3 border-l-2 border-dotted border-teal/50 py-4 pl-9 font-display text-[0.9375rem] font-bold text-navy">
                  <IconArrow className="h-4 w-4 rotate-90 text-teal" />
                  {way}
                </p>
              )}
            </li>
          ))}
        </ol>

        <dl className="mt-12 grid gap-x-10 gap-y-8 border-t border-navy/12 pt-10 sm:grid-cols-3 lg:mt-16 lg:pt-12">
          {loop.steps.map((s) => (
            <div key={s.name}>
              <dt className="font-display text-[1.1875rem] font-bold text-navy">{s.name}</dt>
              <dd className="mt-2 max-w-[36ch] text-[1rem] leading-relaxed text-slate">{s.text}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}
