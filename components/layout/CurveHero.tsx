import Image from 'next/image'
import { HeroShapes } from '@/components/hero/HeroShapes'

type Props = {
  /** Белые строки заголовка и бирюзовые, как на главной. */
  titleLines: readonly string[]
  accentLines: readonly string[]
  lead: string
  photo: { src: string; alt: string }
  /** Кнопки под текстом. */
  children: React.ReactNode
}

/** Первый экран в формах главной: морское поле с фирменной кромкой и фото справа. */
export function CurveHero({ titleLines, accentLines, lead, photo, children }: Props) {
  return (
    <section className="relative bg-navy lg:aspect-[941/390] lg:overflow-hidden">
      <div className="relative z-[2] px-5 pt-9 pb-10 lg:absolute lg:top-1/2 lg:left-[5.31%] lg:w-[32%] lg:-translate-y-1/2 lg:p-0">
        <h1 className="h1 rise-in text-[clamp(1.5rem,2.5vw,2.75rem)] leading-[1.18] tracking-[0.04em] text-white">
          {titleLines.map((line) => (
            <span key={line} className="block">
              {line}{' '}
            </span>
          ))}
          <span className="block text-teal">
            {accentLines.map((line) => (
              <span key={line} className="block">
                {line}{' '}
              </span>
            ))}
          </span>
        </h1>

        <p
          className="rise-in mt-4 max-w-[34ch] text-[clamp(0.9375rem,1.01vw,1.125rem)] leading-[1.55] text-white/90 lg:mt-[1.4vw]"
          style={{ animationDelay: '80ms' }}
        >
          {lead}
        </p>

        <div
          className="rise-in mt-6 flex flex-wrap items-center gap-3 lg:mt-[2.4vw]"
          style={{ animationDelay: '160ms' }}
        >
          {children}
        </div>
      </div>

      <div className="relative aspect-[16/9] lg:absolute lg:inset-y-0 lg:right-0 lg:left-[37.41%] lg:aspect-auto">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority
          quality={90}
          sizes="(min-width: 1024px) 63vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <HeroShapes />
      </div>
    </section>
  )
}
