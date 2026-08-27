'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { CabinetLink } from '@/components/navigation/CabinetLink'
import { nav } from '@/lib/content'

/**
 * Мобильная шапка: та же светлая капсула, что и на десктопе, плюс бургер.
 * При прокрутке вниз она уезжает вверх и освобождает экран, при прокрутке
 * вверх возвращается. Раскрытие идёт через grid-template-rows — высоту
 * содержимого заранее знать не нужно.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [away, setAway] = useState(false)
  const last = useRef(0)

  useEffect(() => {
    if (open) return
    last.current = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setAway(y > last.current && y > 140)
      last.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

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
    <div className="lg:hidden">
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-navy/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        className={`fixed inset-x-4 top-3 z-50 transition-transform duration-300 ease-out ${
          away && !open ? '-translate-y-[160%]' : 'translate-y-0'
        }`}
      >
        <div className="overflow-hidden rounded-[1.75rem] bg-white/85 shadow-[0_10px_30px_rgba(14,26,53,0.16)] ring-1 ring-navy/10 backdrop-blur-[10px]">
          <div className="flex items-center justify-between p-2.5 pl-4">
            {/* «веб»-начертание: мелкая строка тэглайна на этом кегле нечитаема */}
            <a href="#top" aria-label="Блеск — на главную" onClick={() => setOpen(false)}>
              <Image
                src="/brand/logo-web-navy.svg"
                alt="Блеск — профессиональная химчистка"
                width={984}
                height={275}
                className="h-8 w-auto"
              />
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-navy transition-transform duration-200 active:scale-90"
            >
              <span className="relative block h-3.5 w-[18px]">
                <i className={`absolute left-0 ${bar} ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
                <i
                  className={`absolute top-1.5 left-0 ${bar} ${open ? 'opacity-0' : 'opacity-100'}`}
                />
                <i className={`absolute left-0 ${bar} ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
              </span>
            </button>
          </div>

          <div
            id="mobile-menu"
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
              open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <nav aria-label="Разделы" className="border-t border-navy/10 px-3 pt-2 pb-3">
                {nav.map((n) => (
                  <a
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-3 py-3.5 text-[0.9375rem] font-bold text-navy transition-colors duration-200 active:bg-navy/8"
                  >
                    {n.label}
                  </a>
                ))}

                <CabinetLink className="mt-2 px-5 py-3.5" onClick={() => setOpen(false)} />
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
