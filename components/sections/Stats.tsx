'use client'

import { useEffect, useRef, useState } from 'react'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { Container } from '@/components/ui/Container'
import { IconCheck } from '@/components/ui/Icons'
import { stats } from '@/lib/content'

const RUN = 900 // мс на счётчик
const STEP = 130 // мс задержки между колонками
const ease = (t: number) => 1 - Math.pow(1 - t, 3)

/** Число из значения показателя: «15+» → 15, «» → null. */
const num = (v: string) => {
  const n = parseInt(v, 10)
  return Number.isNaN(n) ? null : n
}

/**
 * Полоса показателей: цифры набегают, когда полоса впервые попадает на экран,
 * колонки включаются друг за другом. При «уменьшить движение» — сразу.
 */
export function Stats() {
  const band = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState<number[]>(() => stats.map((s) => num(s.value) ?? 0))
  const [live, setLive] = useState(false)

  useEffect(() => {
    const el = band.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLive(true)
      return
    }

    setShown(stats.map(() => 0))
    let frame = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        setLive(true)
        const start = performance.now()
        const tick = (t: number) => {
          setShown(
            stats.map((s, i) => {
              const p = Math.min(1, Math.max(0, (t - start - i * STEP) / RUN))
              return Math.round((num(s.value) ?? 0) * ease(p))
            }),
          )
          if (t - start < RUN + STEP * stats.length) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section className="bg-cream">
      <Container>
        <div ref={band} className="grid gap-3 py-12 md:grid-cols-3 lg:py-16">
          {stats.map((s, i) => {
            const n = num(s.value)
            return (
              <div
                key={s.unit}
                style={{ transitionDelay: `${i * STEP}ms` }}
                className={`group relative flex flex-col overflow-hidden rounded-2xl px-6 py-7 transition-[background-color,box-shadow,transform,opacity] duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_40px_rgba(14,26,53,0.10)] ${
                  live ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                }`}
              >
                <BrandIcon
                  name={s.icon}
                  className="pointer-events-none absolute right-4 bottom-4 h-24 w-24 opacity-[0.05] transition-transform duration-700 group-hover:scale-110"
                />

                {/* <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(14,26,53,0.06)] transition-colors duration-300 group-hover:bg-teal/10">
                  <BrandIcon name={s.icon} className="h-6 w-6" />
                </span> */}

                <p className="relative mt-6 flex h-[1em] items-center font-display text-[clamp(2.5rem,3.6vw,3.5rem)] leading-none font-extrabold text-navy tabular-nums">
                  {n === null ? (
                    <IconCheck className="h-[0.86em] w-[0.86em] text-teal" />
                  ) : (
                    <>
                      {shown[i]}
                      <span className="text-teal">+</span>
                    </>
                  )}
                </p>

                <p className="relative mt-3 font-display text-[1.0625rem] leading-tight font-bold text-navy">
                  {s.unit}
                </p>
                <p className="relative mt-2 max-w-[32ch] text-[0.875rem] leading-snug text-slate">
                  {s.note}
                </p>

                <span className="mt-auto block pt-6">
                  <span className="relative block h-[3px] w-10 rounded-full bg-teal transition-all duration-500 group-hover:w-20" />
                </span>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
