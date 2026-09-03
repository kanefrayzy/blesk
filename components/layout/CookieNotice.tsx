'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const KEY = 'blesk:cookie-notice'
const CONSENT_EVENT = 'blesk:analytics-consent'

/**
 * Уведомление о cookie.
 *
 * Ответ хранится в localStorage, а не в cookie: заводить cookie ради согласия
 * на cookie незачем, а в приватном окне запись может бросить исключение —
 * поэтому и чтение, и запись обёрнуты.
 *
 * Не модальное окно: страницу не перекрывает, фокус не запирает, читать и
 * листать можно не отвечая.
 */
export function CookieNotice() {
  const [show, setShow] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let seen = false
    try {
      seen = localStorage.getItem(KEY) === 'ok'
    } catch {
      // приватное окно или запрет на хранилище — покажем плашку как обычно
    }
    if (seen) return
    // небольшая пауза, чтобы плашка не спорила с первым экраном
    const t = window.setTimeout(() => setShow(true), 900)
    return () => window.clearTimeout(t)
  }, [])

  const accept = () => {
    try {
      localStorage.setItem(KEY, 'ok')
    } catch {
      // не сохранилось — плашка вернётся в следующий раз, это не поломка
    }
    window.dispatchEvent(new Event(CONSENT_EVENT))
    setLeaving(true)
    window.setTimeout(() => setShow(false), 260)
  }

  if (!show) return null

  return (
    <div
      role="region"
      aria-label="Уведомление о cookie"
      className={`fixed inset-x-3 bottom-3 z-50 mx-auto max-w-[34rem] transition-[opacity,transform] duration-300 ease-out sm:inset-x-5 sm:bottom-5 motion-reduce:transition-none ${
        leaving ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex flex-col gap-4 rounded-2xl bg-navy/95 px-5 py-4 shadow-[0_18px_44px_rgba(5,12,30,0.45)] ring-1 ring-white/12 backdrop-blur-[10px] sm:flex-row sm:items-center sm:gap-5 sm:px-6">
        <p className="text-[0.8125rem] leading-relaxed text-white/75">
          Мы используем файлы cookie для работы сайта и оценки эффективности рекламы.{' '}
          <Link
            href="/politika-obrabotki-personalnyh-dannyh"
            className="text-white underline underline-offset-2"
          >
            Подробнее
          </Link>
        </p>

        <button
          type="button"
          onClick={accept}
          className="h-10 shrink-0 rounded-full bg-teal px-6 font-display text-[0.8125rem] font-bold text-white transition-[background-color,transform] duration-200 hover:bg-teal-hi active:scale-[0.97]"
        >
          Принять
        </button>
      </div>
    </div>
  )
}
