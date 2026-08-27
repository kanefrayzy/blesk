'use client'

import { getImageProps } from 'next/image'
import type { TransitionEvent } from 'react'
import { DUR, EASE, FADE, ITEMS, N } from '@/components/hero/useHeroCarousel'
import type { HeroSlide } from '@/lib/content'

// Вертикальный кадр закрывает весь экран телефона, поэтому пикселей в нём
// вдвое больше широкого. Качество там ниже: экран мелкий и плотный, разницы
// не видно, а вес возвращается к прежнему.
const WIDE = { w: 2048, h: 1504, sizes: '63vw', q: 90 as const }
const TALL = { w: 1104, h: 2048, sizes: '100vw', q: 75 as const }

type Props = {
  pos: number
  dx: number
  fade: boolean
  moving: boolean
  /** Индексы кадров, которым разрешена немедленная загрузка. */
  warm: number[]
  onTransitionEnd: (e: TransitionEvent<HTMLUListElement>) => void
}

/**
 * Кадр слайда. Десктопу отдаём широкий снимок, телефону — вертикальный:
 * окно первого экрана там почти 9:16, и широкий кадр терял бы больше
 * половины ширины на обрезке.
 *
 * Через picture, а не через два Image: display:none браузер картинке не
 * считает запретом на загрузку, и оба файла ушли бы в сеть. Здесь источник
 * выбирает сам браузер по media, а грузит ровно один.
 *
 * Ручной link rel=preload здесь не ставим: через picture он тянул лишний
 * кадр в 3840 px на всех ширинах сразу. Первый кадр и так лежит в исходной
 * разметке с fetchPriority=high — сканер предзагрузки находит его сам.
 */
function SlidePhoto({
  slide,
  hidden,
  eager,
}: {
  slide: HeroSlide
  hidden: boolean
  eager: boolean
}) {
  const alt = hidden ? '' : slide.alt

  const {
    props: { srcSet: wide },
  } = getImageProps({
    alt,
    src: slide.photo,
    width: WIDE.w,
    height: WIDE.h,
    sizes: WIDE.sizes,
    quality: WIDE.q,
  })

  const {
    props: { srcSet: tall, ...rest },
  } = getImageProps({
    alt,
    src: slide.photoMobile,
    width: TALL.w,
    height: TALL.h,
    sizes: TALL.sizes,
    quality: TALL.q,
  })

  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={wide} sizes={WIDE.sizes} />
      <source srcSet={tall} sizes={TALL.sizes} />
      <img
        {...rest}
        draggable={false}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        className="absolute inset-0 h-full w-full object-cover object-[50%_46%]"
      />
    </picture>
  )
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
            <SlidePhoto
              slide={s}
              hidden={clone}
              eager={i === 1 || warm.includes(real)}
            />
          </li>
        )
      })}
    </ul>
  )
}
