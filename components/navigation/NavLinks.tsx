'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { nav } from '@/lib/content'

type Spot = { x: number; w: number } | null

/**
 * Разделы с подсветкой-пилюлей: по умолчанию она под разделом, который сейчас
 * на экране, при наведении переезжает под курсор. Цвет наследуется от родителя.
 */
export function NavLinks({ className = '' }: { className?: string }) {
  const box = useRef<HTMLElement>(null)
  const items = useRef<(HTMLAnchorElement | null)[]>([])
  const seen = useRef<Record<string, boolean>>({})

  const [active, setActive] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [spot, setSpot] = useState<Spot>(null)

  const shown = hover ?? active

  const place = useCallback(() => {
    const parent = box.current
    const el = shown === null ? null : items.current[shown]
    if (!parent || !el) {
      setSpot(null)
      return
    }
    const a = el.getBoundingClientRect()
    const b = parent.getBoundingClientRect()
    setSpot({ x: a.left - b.left, w: a.width })
  }, [shown])

  useLayoutEffect(place, [place])

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(place)
    ro.observe(el)
    return () => ro.disconnect()
  }, [place])

  useEffect(() => {
    // У раздела новостей якоря нет — на главной он просто никогда не активен.
    const ids = nav.map((n) => n.href.split('#')[1] ?? '')
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e)
    if (!els.length) return

    // узкая полоса поперёк экрана: раздел активен, когда пересекает её
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          seen.current[e.target.id] = e.isIntersecting
        })
        const i = ids.findIndex((id) => seen.current[id])
        setActive(i >= 0 ? i : null)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])

  return (
    <nav
      ref={box}
      aria-label="Разделы"
      onPointerLeave={() => setHover(null)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHover(null)
      }}
      className={`relative items-center gap-0.5 ${className}`}
    >
      <span
        aria-hidden="true"
        style={{
          backgroundColor: 'currentColor',
          transform: `translateX(${spot?.x ?? 0}px)`,
          width: spot?.w ?? 0,
          opacity: spot ? 0.12 : 0,
        }}
        className="pointer-events-none absolute inset-y-0 left-0 rounded-full transition-[transform,width,opacity] duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
      />

      {nav.map((n, i) => (
        <a
          key={n.href}
          href={n.href}
          ref={(el) => {
            items.current[i] = el
          }}
          aria-current={i === active ? 'true' : undefined}
          onPointerEnter={() => setHover(i)}
          onFocus={() => setHover(i)}
          onClick={() => setActive(i)}
          /* Начертание не меняем: от него поедет ширина ссылки, а за ней пилюля. */
          className="relative rounded-full px-3.5 py-2.5 text-[0.875rem] leading-none font-bold transition-transform duration-200 active:scale-95"
        >
          {n.label}
        </a>
      ))}
    </nav>
  )
}
