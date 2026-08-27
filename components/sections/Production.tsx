'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { production } from '@/lib/content'

const N = production.length
const PANEL = 85 // svh прокрутки на одну панель закреплённой ленты
const EDGE = 'max(1.25rem,calc((100vw-1280px)/2+2rem))'

const Shade = () => (
  <div
    aria-hidden="true"
    className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-transparent"
  />
)

function Caption({ index, big }: { index: number; big: boolean }) {
  // Десктопная лента — визуальный дубль мобильной стопки, поэтому её
  // подписи не заголовки: иначе в документе восемь h3 вместо четырёх.
  const Name = big ? 'p' : 'h3'
  return (
    <div className={`relative mt-auto w-full ${big ? 'p-10' : 'p-6'}`}>
      <span className="font-display text-[0.75rem] leading-none font-extrabold tracking-[0.2em] text-teal tabular-nums">
        {String(index + 1).padStart(2, '0')}
      </span>
      <Name
        className={`h2 mt-3 text-white ${big ? 'text-[clamp(1.25rem,2.2vw,1.875rem)]' : 'text-[1.25rem]'}`}
      >
        {production[index].name}
      </Name>
      <p className="mt-2 max-w-[42ch] text-[0.9375rem] leading-snug text-white/75">
        {production[index].note}
      </p>
    </div>
  )
}

/**
 * Производство. Две разные раскладки, а не одна на все ширины.
 *
 * Десктоп: блок закрепляется, и пока его прокручивают, кадры едут вбок.
 * Прокрутка не перехвачена — блок просто высокий, а внутри sticky-панель.
 *
 * Телефон: горизонтальная лента там читалась бы как слайдер, поэтому
 * карточки идут стопкой — каждая прилипает чуть ниже предыдущей. Чистый CSS.
 */
export function Production() {
  const wrap = useRef<HTMLDivElement>(null)
  const view = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  const step = useRef(0)

  const [pinned, setPinned] = useState(false)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setPinned(!calm.matches)
    sync()
    calm.addEventListener('change', sync)
    return () => calm.removeEventListener('change', sync)
  }, [])

  const read = useCallback(() => {
    const el = wrap.current
    const t = track.current
    const v = view.current
    if (!el || !t || !v) return
    const span = el.offsetHeight - window.innerHeight
    const go = t.scrollWidth - v.clientWidth
    if (span <= 0 || go <= 0) return
    const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / span))
    t.style.transform = `translate3d(${-(p * go).toFixed(1)}px, 0, 0)`
    if (fill.current) fill.current.style.transform = `scaleX(${p.toFixed(4)})`
    const i = Math.min(N - 1, Math.round(p * (N - 1)))
    if (i !== step.current) {
      step.current = i
      setShown(i)
    }
  }, [])

  useEffect(() => {
    if (!pinned) {
      if (track.current) track.current.style.transform = ''
      return
    }
    let frame = 0
    const onScroll = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0
          read()
        })
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pinned, read])

  /** Без закрепления лентой двигает сама прокрутка — ведём по ней номер. */
  const onRailScroll = () => {
    const v = view.current
    if (!v || pinned) return
    const go = v.scrollWidth - v.clientWidth
    const i = go > 0 ? Math.round((v.scrollLeft / go) * (N - 1)) : 0
    if (i !== step.current) {
      step.current = i
      setShown(i)
    }
  }

  return (
    <section id="proizvodstvo" aria-labelledby="prod-title" className="bg-cream">
      {/* ------------------------------------- телефон: карточки стопкой */}
      <div className="px-5 py-14 lg:hidden">
        <h2 id="prod-title" className="h2 text-[1.5rem] text-navy">
          Наше производство в Жуковском
        </h2>

        {/* Кремовое кольцо отделяет края карточек в стопке */}
        <ol className="mt-8">
          {production.map((p, i) => (
            <li key={p.name} className="sticky" style={{ top: `${76 + i * 12}px` }}>
              <article className="relative mb-5 flex h-[56svh] max-h-[520px] min-h-[340px] overflow-hidden rounded-3xl shadow-[0_18px_44px_rgba(14,26,53,0.18)] ring-4 ring-cream">
                <Image src={p.photo} alt={p.name} fill sizes="92vw" className="object-cover" />
                <Shade />
                <Caption index={i} big={false} />
              </article>
            </li>
          ))}
        </ol>
      </div>

      {/* ---------------------------------- десктоп: закреплённая лента */}
      <div
        ref={wrap}
        className="relative hidden lg:block"
        style={pinned ? { height: `calc(100svh + ${(N - 1) * PANEL}svh)` } : undefined}
      >
        <div
          className={
            pinned ? 'sticky top-0 flex h-svh flex-col justify-center overflow-hidden' : 'py-20'
          }
        >
          <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-end justify-between gap-4 px-8">
            {/* Заголовок объявлен в мобильной раскладке; здесь визуальный дубль */}
            <p className="h2 text-[clamp(1.5rem,2.6vw,2rem)] text-navy" aria-hidden="true">
              Наше производство в Жуковском
            </p>

            <div className="flex items-center gap-4">
              <span className="font-display text-[0.8125rem] leading-none font-extrabold text-navy tabular-nums">
                {String(shown + 1).padStart(2, '0')}
                <span className="text-slate-soft"> / {String(N).padStart(2, '0')}</span>
              </span>
              <span className="block h-[3px] w-44 overflow-hidden rounded-full bg-navy/12">
                <span
                  ref={fill}
                  className="block h-full w-full origin-left rounded-full bg-teal"
                  style={{ transform: pinned ? 'scaleX(0)' : 'scaleX(1)' }}
                />
              </span>
            </div>
          </div>

          <div
            ref={view}
            onScroll={onRailScroll}
            className={`mt-10 ${
              pinned
                ? 'overflow-hidden'
                : 'snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            }`}
          >
            <div ref={track} className="flex gap-7" style={{ paddingLeft: EDGE, paddingRight: EDGE }}>
              {production.map((p, i) => (
                <article
                  key={p.name}
                  aria-hidden="true"
                  className="relative flex h-[62svh] max-h-[620px] min-h-[380px] w-[58vw] max-w-[880px] shrink-0 snap-center overflow-hidden rounded-3xl"
                >
                  <Image src={p.photo} alt="" fill sizes="58vw" className="object-cover" />
                  <Shade />
                  <Caption index={i} big />
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
