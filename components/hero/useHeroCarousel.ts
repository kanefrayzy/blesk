'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type TransitionEvent,
} from 'react'
import { heroSlides } from '@/lib/content'

export const N = heroSlides.length
/** Клон последнего кадра спереди и первого сзади — для бесшовной петли. */
export const ITEMS = [heroSlides[N - 1], ...heroSlides, heroSlides[0]]

export const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'
export const DUR = 480 // мс на переход между соседними кадрами
export const FADE = 200 // мс на перекрёстное затухание при дальнем прыжке
export const AUTOPLAY = 6000 // мс на кадр автопрокрутки

const SWIPE_PART = 0.16 // доля ширины кадра для «медленного» листания
const SWIPE_MIN = 0.06 // минимальный путь, чтобы флик вообще засчитался
const SWIPE_SPEED = 0.45 // px/мс
const SPEED_WINDOW = 120 // мс

/**
 * Лента первого экрана: петля через клоны, свайп, клавиатура, автопрокрутка.
 * Вынесена из разметки — Hero остаётся вёрсткой, а не машиной состояний.
 */
export function useHeroCarousel() {
  /** Позиция в ITEMS: 0 и N+1 — клоны. */
  const [pos, setPos] = useState(1)
  /** Настоящий показанный кадр: ведётся отдельно, чтобы точки и текст
      не мигали в момент бесшовной перестановки. */
  const [active, setActive] = useState(0)
  const [animate, setAnimate] = useState(true)
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [fade, setFade] = useState(false)

  /** То же, что pos, но читается синхронно. */
  const posRef = useRef(1)
  /** Страховочный таймер на случай, если transitionend не придёт. */
  const settle = useRef<number | null>(null)
  /** Шаг, отложенный до возвращения анимации. */
  const queued = useRef<1 | -1 | null>(null)
  /** Значение animate из последнего коммита. */
  const animateRef = useRef(true)
  /** Пока идёт дальний прыжок, новые команды не принимаем. */
  const busy = useRef(false)

  const gesture = useRef<{
    x: number
    y: number
    axis: 'x' | 'y' | null
    width: number
    hist: { t: number; x: number }[]
  } | null>(null)

  const flush = useCallback(() => {
    if (settle.current !== null) {
      window.clearTimeout(settle.current)
      settle.current = null
    }
    const p = posRef.current
    const real = p === 0 ? N : p === N + 1 ? 1 : p
    if (real === p) return false
    posRef.current = real
    setAnimate(false)
    setPos(real)
    return true
  }, [])

  const applyStep = useCallback(
    (dir: 1 | -1) => {
      const p = posRef.current + dir
      posRef.current = p
      setPos(p)
      setActive((a) => (a + dir + N) % N)
      if (p === 0 || p === N + 1) settle.current = window.setTimeout(flush, DUR + 80)
    },
    [flush],
  )

  const step = useCallback(
    (dir: 1 | -1) => {
      if (busy.current) return
      const wasAnimating = animateRef.current
      // если стоим на клоне — сначала перестановка, шаг подождёт кадр
      if (flush() && wasAnimating) queued.current = dir
      else applyStep(dir)
    },
    [flush, applyStep],
  )

  /** Включаем анимацию обратно через два кадра, иначе браузер объединит
      выключение и новое значение в один переход. */
  useLayoutEffect(() => {
    animateRef.current = animate
    if (animate) {
      const q = queued.current
      if (q) {
        queued.current = null
        applyStep(q)
      }
      return
    }
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setAnimate(true))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [animate, applyStep])

  useEffect(
    () => () => {
      if (settle.current !== null) window.clearTimeout(settle.current)
    },
    [],
  )

  /** Соседние кадры прогреваются заранее: слайды сдвинуты трансформом за
      пределы окна, ленивая загрузка их не видит, и на переключении был бы
      белый провал. Все шесть сразу грузить нельзя — это лишний вес. */
  const [warm, setWarm] = useState<number[]>([0, 1, N - 1])
  useEffect(() => {
    setWarm((w) => {
      const need = [active, (active + 1) % N, (active - 1 + N) % N]
      const miss = need.filter((i) => !w.includes(i))
      return miss.length ? [...w, ...miss] : w
    })
  }, [active])

  /* ---------------------------------------------------- автопрокрутка */

  /** Включается только после монтирования: до гидратации разметка обязана
      совпасть с серверной. При «уменьшить движение» не включается вовсе. */
  const [auto, setAuto] = useState(false)
  const [hover, setHover] = useState(false)
  const [inView, setInView] = useState(true)
  const section = useRef<HTMLElement>(null)

  useEffect(() => {
    setAuto(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    const el = section.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  /** Пауза: под курсором, под пальцем, вне экрана и на время затухания. */
  const playing = auto && inView && !hover && !dragging && !fade

  /* ---------------------------------------------------------- жесты */

  const jumpTo = (target: number) => {
    if (target === active || busy.current) return
    const forward = (target - active + N) % N
    const dir: 1 | -1 = forward * 2 <= N ? 1 : -1
    const steps = dir === 1 ? forward : N - forward
    if (steps === 1) {
      step(dir)
      return
    }
    // Дальний прыжок: проезжать все промежуточные кадры неправильно, а
    // мгновенная подмена читается как сбой — короткое затухание.
    flush()
    busy.current = true
    setFade(true)
    setActive(target)
    window.setTimeout(() => {
      queued.current = null
      setAnimate(false)
      posRef.current = target + 1
      setPos(target + 1)
      setFade(false)
      busy.current = false
    }, FADE)
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (busy.current) return
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    gesture.current = {
      x: e.clientX,
      y: e.clientY,
      axis: null,
      width: el.clientWidth || 1,
      hist: [{ t: e.timeStamp, x: e.clientX }],
    }
    setDragging(true)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current
    if (!g) return
    const mx = e.clientX - g.x
    const my = e.clientY - g.y

    if (!g.axis) {
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return
      g.axis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y'
      if (g.axis === 'y') {
        // вертикальный жест — отдаём странице, лента не мешает скроллу
        e.currentTarget.releasePointerCapture(e.pointerId)
        gesture.current = null
        setDragging(false)
        return
      }
    }

    g.hist.push({ t: e.timeStamp, x: e.clientX })
    while (g.hist.length > 2 && e.timeStamp - g.hist[0].t > SPEED_WINDOW) g.hist.shift()
    setDx(mx)
  }

  const endGesture = () => {
    const g = gesture.current
    if (!g) return
    gesture.current = null
    setDragging(false)
    const moved = dx
    setDx(0)
    if (g.axis !== 'x') return
    const first = g.hist[0]
    const last = g.hist[g.hist.length - 1]
    const span = last.t - first.t
    const speed = span > 0 ? (last.x - first.x) / span : 0
    const far = Math.abs(moved) > g.width * SWIPE_PART
    const fast = Math.abs(speed) > SWIPE_SPEED && Math.abs(moved) > g.width * SWIPE_MIN
    if (!far && !fast) return
    step(moved < 0 ? 1 : -1)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      step(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      step(-1)
    }
  }

  /** Доехали до клона — переставляем, не дожидаясь таймера. */
  const onTransitionEnd = (e: TransitionEvent<HTMLUListElement>) => {
    // прозрачность тоже анимируется — реагируем только на сдвиг
    if (e.propertyName !== 'transform' || e.target !== e.currentTarget) return
    flush()
  }

  /** Пауза под курсором — про мышь. Палец сюда не пускаем: после тапа
      pointerleave может не прийти, и автопрокрутка встала бы навсегда. */
  const pauseProps = {
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType !== 'touch') setHover(true)
    },
    onPointerLeave: () => setHover(false),
  }

  const dragProps = {
    onPointerDown,
    onPointerMove,
    onPointerUp: endGesture,
    onPointerCancel: endGesture,
    onLostPointerCapture: endGesture,
    onKeyDown,
    onFocus: () => setHover(true),
    onBlur: () => setHover(false),
    onDragStart: (e: { preventDefault: () => void }) => e.preventDefault(),
    ...pauseProps,
  }

  const focusPauseProps = {
    onFocusCapture: () => setHover(true),
    onBlurCapture: () => setHover(false),
    ...pauseProps,
  }

  return {
    section,
    pos,
    active,
    dx,
    fade,
    warm,
    auto,
    playing,
    moving: animate && !dragging,
    step,
    jumpTo,
    dragProps,
    focusPauseProps,
    onTransitionEnd,
  }
}
