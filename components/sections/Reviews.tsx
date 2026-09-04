'use client'

import { useState } from 'react'
import { CircleButton } from '@/components/ui/CircleButton'
import { IconArrow, IconChevron, IconStar } from '@/components/ui/Icons'
import { reviews, reviewsSource } from '@/lib/content'

export function Reviews() {
  const [i, setI] = useState(0)
  const r = reviews[i]
  const go = (d: 1 | -1) => setI((n) => (n + d + reviews.length) % reviews.length)

  return (
    <div className="flex flex-col rounded-xl bg-white px-7 py-8">
      <h3 className="h2 text-[1.0625rem] text-navy">Отзывы клиентов</h3>

      <div role="img" className="mt-4 flex gap-1" aria-label={`Оценка ${r.rating} из 5`}>
        {Array.from({ length: 5 }, (_, n) => (
          <IconStar key={n} className={`h-4 w-4 ${n < r.rating ? 'text-[#f0a500]' : 'text-line'}`} />
        ))}
      </div>

      <blockquote className="mt-4 grow text-[0.875rem] leading-relaxed text-slate">
        {/* Высота под самый длинный отзыв: иначе карточка прыгает при листании. */}
        <p aria-live="polite" className="lg:min-h-[8.75rem]">
          {r.text}
        </p>
        <footer className="mt-4 text-[0.8125rem] font-semibold text-navy">
          {r.name}
          <span className="ml-2 font-normal text-slate-soft">{r.date}</span>
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
          {i + 1} / {reviews.length}
        </span>
      </div>

      <a
        href={reviewsSource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-1.5 border-t border-line pt-5 text-[0.8125rem] text-slate-soft transition-colors duration-200 hover:text-teal"
      >
        <span className="font-semibold text-navy tabular-nums">{reviewsSource.rating}</span>
        <span>на Яндекс Картах, {reviewsSource.count} отзыва</span>
        <IconArrow className="h-4 w-4 text-teal" />
      </a>
    </div>
  )
}
