'use client'

import Image from 'next/image'
import type { TransitionEvent } from 'react'
import { DUR, EASE, FADE, ITEMS, N } from '@/components/hero/useHeroCarousel'

type Props = {
  pos: number
  dx: number
  fade: boolean
  moving: boolean
  /** Индексы кадров, которым разрешена немедленная загрузка. */
  warm: number[]
  onTransitionEnd: (e: TransitionEvent<HTMLUListElement>) => void
}

export function HeroSlides({ pos, dx, fade, moving, warm, onTransitionEnd }: Props) {
  return (
    <ul
      onTransitionEnd={onTransitionEnd}
      className="flex h-full"
      style={{
        transform: `translate3d(calc(${-pos * 100}% + ${dx}px), 0, 0)`,
        opacity: fade ? 0 : 1,
        transition: moving
          ? `transform ${DUR}ms ${EASE}, opacity ${FADE}ms ease`
          : `opacity ${FADE}ms ease`,
      }}
    >
      {ITEMS.map((s, i) => {
        const real = (i - 1 + N) % N
        const clone = i === 0 || i === N + 1
        return (
          <li
            key={`${s.key}-${i}`}
            aria-hidden={clone || undefined}
            aria-roledescription={clone ? undefined : 'слайд'}
            aria-label={clone ? undefined : `${real + 1} из ${N}: ${s.label}`}
            className="relative h-full w-full shrink-0"
          >
            <Image
              src={s.photo}
              alt={clone ? '' : s.alt}
              fill
              sizes="(max-width: 1023px) 100vw, 63vw"
              quality={90}
              className="object-cover object-[50%_46%]"
              draggable={false}
              {...(i === 1
                ? { priority: true }
                : { loading: warm.includes(real) ? ('eager' as const) : ('lazy' as const) })}
            />
          </li>
        )
      })}
    </ul>
  )
}
