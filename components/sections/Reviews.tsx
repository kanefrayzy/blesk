'use client'

import { useState } from 'react'
import { CircleButton } from '@/components/ui/CircleButton'
import { IconChevron, IconStar } from '@/components/ui/Icons'
import { demoReviews } from '@/lib/content'

/** Содержимое демонстрационное — см. предупреждение над demoReviews. */
export function Reviews() {
  const [i, setI] = useState(0)
  const r = demoReviews[i]
  const go = (d: 1 | -1) => setI((n) => (n + d + demoReviews.length) % demoReviews.length)

  return (
    <div className="flex flex-col rounded-xl bg-white px-7 py-8">
      <h3 className="h2 text-[1.0625rem] text-navy">Отзывы клиентов</h3>

      <p className="mt-4 flex gap-1" aria-label={`Оценка ${r.rating} из 5`}>
        {Array.from({ length: 5 }, (_, n) => (
          <IconStar key={n} className={`h-4 w-4 ${n < r.rating ? 'text-[#f0a500]' : 'text-line'}`} />
        ))}
      </p>

      <blockquote className="mt-4 grow text-[0.875rem] leading-relaxed text-slate">
        <p aria-live="polite">{r.text}</p>
        <footer className="mt-4 text-[0.8125rem] font-semibold text-navy">
          {r.name}
          <span className="ml-2 font-normal text-slate-soft">{r.role}</span>
        </footer>
      </blockquote>

      <div className="mt-6 flex items-center gap-2">
        <CircleButton label="Предыдущий отзыв" size="sm" onClick={() => go(-1)}>
          <IconChevron className="h-4 w-4 rotate-180" />
        </CircleButton>
        <CircleButton label="Следующий отзыв" size="sm" onClick={() => go(1)}>
          <IconChevron className="h-4 w-4" />
        </CircleButton>
        <span className="ml-1 text-[0.75rem] text-slate-soft">
          {i + 1} / {demoReviews.length}
        </span>
      </div>
    </div>
  )
}
