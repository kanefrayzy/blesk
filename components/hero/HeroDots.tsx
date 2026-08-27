'use client'

import { heroSlides } from '@/lib/content'
import { AUTOPLAY } from '@/components/hero/useHeroCarousel'

type Props = {
  active: number
  auto: boolean
  playing: boolean
  /** compact — вариант для мобильной раскладки: светлые точки без капсулы. */
  compact?: boolean
  onJump: (i: number) => void
  onDone: () => void
}

/**
 * Точки ленты. Заливка активной точки — она же таймер автопрокрутки:
 * следующий кадр включается по animationend, поэтому индикатор и переход
 * не могут разъехаться.
 */
export function HeroDots({ active, auto, playing, compact = false, onJump, onDone }: Props) {
  return (
    <ul className={compact ? 'flex items-center gap-2' : 'flex items-center gap-[0.4vw] px-[0.5vw]'}>
      {heroSlides.map((s, i) => (
        <li key={s.key} className="flex">
          <button
            type="button"
            onClick={() => onJump(i)}
            aria-label={s.label}
            aria-current={i === active ? 'true' : undefined}
            className="group -mx-0.5 -my-2 flex items-center px-1.5 py-2"
          >
            <span
              className={`block overflow-hidden rounded-full transition-all duration-300 group-active:scale-y-75 ${
                compact ? 'h-1.5' : 'h-[0.42vw]'
              } ${
                i === active
                  ? compact
                    ? 'w-7 bg-white/25'
                    : 'w-[1.6vw] bg-navy/20'
                  : compact
                    ? 'w-1.5 bg-white/40'
                    : 'w-[0.42vw] bg-navy/25 group-hover:bg-navy/50'
              }`}
            >
              {i === active && (
                <span
                  key={auto ? active : 'static'}
                  onAnimationEnd={(e) => {
                    if (e.animationName === 'dot-fill') onDone()
                  }}
                  style={
                    auto
                      ? {
                          animationDuration: `${AUTOPLAY}ms`,
                          animationPlayState: playing ? 'running' : 'paused',
                        }
                      : undefined
                  }
                  className={`block h-full w-full rounded-full ${compact ? 'bg-white' : 'bg-teal'} ${
                    auto ? 'animate-dot-fill' : ''
                  }`}
                />
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
