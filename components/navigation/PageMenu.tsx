'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CabinetLink } from '@/components/navigation/CabinetLink'
import { nav } from '@/lib/content'

/**
 * Бургер шапки внутренних страниц. Шапка стоит в потоке и уезжает вместе
 * со страницей, поэтому меню раскрывается прямо под ней и текст не перекрывает.
 */
export function PageMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const bar = 'block h-[2px] w-full rounded-full bg-white transition-all duration-300 ease-out'

  return (
    <div className="ml-auto lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="page-menu"
        aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
        className="relative z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/12 transition-[background-color,transform] duration-200 active:scale-90"
      >
        <span className="relative block h-3.5 w-[18px]">
          <i className={`absolute left-0 ${bar} ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
          <i className={`absolute top-1.5 left-0 ${bar} ${open ? 'opacity-0' : 'opacity-100'}`} />
          <i className={`absolute left-0 ${bar} ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
        </span>
      </button>

      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-navy/60 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        id="page-menu"
        className={`absolute inset-x-4 top-full z-50 origin-top rounded-3xl bg-white p-3 shadow-[0_20px_50px_rgba(14,26,53,0.28)] transition-[opacity,transform] duration-200 ease-out ${
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-2 opacity-0'
        }`}
      >
        <nav aria-label="Разделы">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-3 py-3.5 text-[0.9375rem] font-bold text-navy transition-colors duration-200 active:bg-navy/8"
            >
              {n.label}
            </Link>
          ))}

          <CabinetLink className="mt-2 px-5 py-3.5" onClick={() => setOpen(false)} />
        </nav>
      </div>
    </div>
  )
}
