'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CircleButton } from '@/components/ui/CircleButton'
import { IconChevron } from '@/components/ui/Icons'
import { useContent } from '@/components/content/ContentProvider'
import { ServiceCard } from '@/components/sections/ServiceCard'

/**
 * Лента услуг. Прокрутка нативная (scroll-snap), стрелки лишь двигают её на
 * карточку — лента остаётся рабочей и без JavaScript, и с клавиатуры.
 *
 * Если все карточки помещаются в контейнер, лента перестаёт быть лентой:
 * стрелки прячутся, роль карусели снимается. Меряется по DOM, а не по
 * контрольной точке, поэтому седьмая услуга вернёт стрелки сама.
 */
export function ServicesSlider() {
  const { services } = useContent()
  const track = useRef<HTMLUListElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)
  const [fits, setFits] = useState(false)

  const sync = useCallback(() => {
    const el = track.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    // допуск в 2px: дробные ширины карточек дают остаток при точном стыке
    setFits(max <= 2)
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft < max - 4)
  }, [])

  useEffect(() => {
    const el = track.current
    if (!el) return
    sync()
    el.addEventListener('scroll', sync, { passive: true })
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', sync)
      ro.disconnect()
    }
  }, [sync])

  const move = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    const card = el.querySelector('li')
    const gap = parseFloat(getComputedStyle(el).columnGap || '20') || 20
    const step = card ? card.getBoundingClientRect().width + gap : el.clientWidth
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * step, behavior: smooth ? 'smooth' : 'auto' })
  }

  return (
    <div
      {...(fits
        ? {}
        : {
            role: 'group' as const,
            'aria-roledescription': 'карусель',
            'aria-label': 'Услуги «Блеска»',
          })}
      className="mt-12"
    >
      <ul
        ref={track}
        {...(fits ? {} : { tabIndex: 0, 'aria-label': 'Лента услуг, прокручивается вбок' })}
        className={`flex gap-5 overflow-x-auto pb-8 [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal [&::-webkit-scrollbar]:hidden ${
          fits ? 'justify-center' : 'snap-x snap-mandatory'
        }`}
      >
        {services.map((s) => (
          <li
            key={s.name}
            /* Доли контейнера, а не фиксированные ширины: на xl шесть карточек
               встают ровно в строку — там лента и выключается. */
            className={`w-[80%] shrink-0 text-center sm:w-[calc((100%-1.25rem)/2)] md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)] xl:w-[calc((100%-6.25rem)/6)] ${
              fits ? '' : 'snap-start'
            }`}
          >
            <ServiceCard
              service={s}
              sizes="(max-width: 639px) 80vw, (max-width: 767px) 45vw, (max-width: 1023px) 31vw, (max-width: 1279px) 24vw, 200px"
            />
          </li>
        ))}
      </ul>

      {!fits && (
        <div className="mt-6 flex justify-center gap-3">
          <CircleButton label="Предыдущие услуги" onClick={() => move(-1)} disabled={!canPrev}>
            <IconChevron className="h-4 w-4 rotate-180" />
          </CircleButton>
          <CircleButton label="Следующие услуги" onClick={() => move(1)} disabled={!canNext}>
            <IconChevron className="h-4 w-4" />
          </CircleButton>
        </div>
      )}
    </div>
  )
}
