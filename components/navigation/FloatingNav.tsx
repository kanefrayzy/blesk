'use client'

import Image from 'next/image'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { NavLinks } from '@/components/navigation/NavLinks'
import { CabinetLink } from '@/components/navigation/CabinetLink'

const DOCK_TOP = 12 // отступ от верха в закреплённом положении
const PHOTO = 0.3741 // левый край фотографии первого экрана, доля ширины
const HEADER = 0.078 // высота шапки первого экрана, доля ширины
const START = 30 // с какой прокрутки начинается переезд
const END = 320 // на какой он закончен
const SPRING = 0.14 // насколько догоняем цель за кадр

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Одно меню на всю страницу: светлая полоса, которая на первом экране стоит
 * справа, а при прокрутке съезжает к центру верха и уплотняется. Положение
 * сглаживается пружиной — иначе полоса идёт ступенями колеса мыши.
 */
export function FloatingNav() {
  const bar = useRef<HTMLDivElement>(null)
  const skin = useRef<HTMLDivElement>(null)
  const now = useRef(0)
  const goal = useRef(0)
  const frame = useRef(0)

  const paint = useCallback(() => {
    const root = bar.current
    const face = skin.current
    if (!root || !face) return
    const vw = window.innerWidth
    const { width, height } = root.getBoundingClientRect()
    const t = now.current

    // на первом экране полоса стоит по центру правого блока — фотографии
    const heroLeft = vw * (PHOTO + (1 - PHOTO) / 2) - width / 2
    const heroTop = (vw * HEADER - height) / 2
    // до гидратации полоса стоит на классах, дальше ведём её трансформом
    root.style.right = 'auto'
    root.style.left = '0px'
    root.style.top = '0px'
    root.style.transform =
      `translate3d(${lerp(heroLeft, (vw - width) / 2, t).toFixed(1)}px, ` +
      `${lerp(heroTop, DOCK_TOP, t).toFixed(1)}px, 0)`

    face.style.backgroundColor = `rgba(255, 255, 255, ${lerp(0.72, 0.9, t).toFixed(3)})`
    face.style.boxShadow =
      `0 0 0 1px rgba(14, 26, 53, ${lerp(0.06, 0.1, t).toFixed(3)}), ` +
      `0 ${lerp(6, 12, t).toFixed(0)}px ${lerp(20, 32, t).toFixed(0)}px ` +
      `rgba(14, 26, 53, ${lerp(0.1, 0.17, t).toFixed(3)})`
  }, [])

  const tick = useCallback(() => {
    const d = goal.current - now.current
    now.current = Math.abs(d) < 0.0015 ? goal.current : now.current + d * SPRING
    paint()
    frame.current = now.current === goal.current ? 0 : requestAnimationFrame(tick)
  }, [paint])

  useLayoutEffect(() => {
    now.current = goal.current = Math.min(1, Math.max(0, (window.scrollY - START) / (END - START)))
    paint()
  }, [paint])

  useEffect(() => {
    const onScroll = () => {
      goal.current = Math.min(1, Math.max(0, (window.scrollY - START) / (END - START)))
      if (!frame.current) frame.current = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', paint)
    return () => {
      cancelAnimationFrame(frame.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', paint)
    }
  }, [tick, paint])

  return (
    <div
      ref={bar}
      className="fixed top-[calc(3.9vw-26px)] right-[3.4%] z-40 hidden w-max will-change-transform lg:block"
    >
      <div
        ref={skin}
        className="flex items-center gap-3 rounded-full bg-white/72 py-1.5 pr-1.5 pl-3 text-navy backdrop-blur-[10px]"
      >
        <Image
          src="/brand/mark-navy.svg"
          alt=""
          aria-hidden="true"
          width={64}
          height={64}
          className="h-7 w-7 shrink-0"
        />

        <NavLinks className="hidden xl:flex" />

        <CabinetLink className="px-5 py-2.5" />
      </div>
    </div>
  )
}
