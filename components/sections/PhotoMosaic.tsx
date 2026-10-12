import Image from 'next/image'
import { Container } from '@/components/ui/Container'

type Shot = { key: string; src: string; alt: string; name: string }

type Props = { title: string; text: string; shots: Shot[] }

// Шахматная раскладка: широкий кадр и узкий, строкой ниже наоборот.
const spans = ['sm:col-span-7', 'sm:col-span-5', 'sm:col-span-5', 'sm:col-span-7']

/** Фото производства на морском поле. */
export function PhotoMosaic({ title, text, shots }: Props) {
  return (
    <section className="bg-navy">
      <Container className="py-14 lg:py-24">
        <div className="lg:flex lg:items-end lg:justify-between lg:gap-16">
          <h2 className="h2 text-[clamp(1.75rem,3.2vw,2.75rem)] text-white">{title}</h2>
          <p className="mt-4 max-w-[44ch] text-[1.0625rem] leading-relaxed text-white/70 lg:mt-0 lg:pb-1">
            {text}
          </p>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-12 lg:mt-12 lg:gap-5">
          {shots.map((s, i) => (
            <li key={s.key} className={spans[i % spans.length]}>
              <figure className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-navy-2 sm:aspect-auto sm:h-64 lg:h-[23rem]">
                <Image src={s.src} alt={s.alt} fill sizes="(min-width: 640px) 58vw, 92vw" className="object-cover" />
                <figcaption className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2.5 text-[0.8125rem] leading-none font-semibold text-navy shadow-[0_6px_18px_rgba(14,26,53,0.2)]">
                  {s.name}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
