'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, Ellipsis, Share, SquarePlus, X } from 'lucide-react'

type Browser = {
  /** Safari, а не Chrome или другой браузер поверх него. */
  safari: boolean
  /** Safari 26: «Поделиться» спрятано в меню «⋯» справа внизу. */
  menu: boolean
  ipad: boolean
}

function detect(): Browser {
  const ua = navigator.userAgent
  const version = Number(/Version\/(\d+)/.exec(ua)?.[1] ?? 0)
  return {
    safari: /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|YaBrowser|OPiOS|GSA/.test(ua),
    menu: version >= 26,
    ipad: /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
  }
}

const STEP_MS = 2600

/**
 * Как добавить сайт на экран «Домой». Сделать это за клиента iOS не даёт,
 * поэтому показываем шаги на макетах экрана и подсвечиваем их по очереди.
 */
export function HomeScreenGuide({ onClose }: { onClose: () => void }) {
  const [browser, setBrowser] = useState<Browser | null>(null)
  const [active, setActive] = useState(0)

  useEffect(() => setBrowser(detect()), [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setActive((step) => (step + 1) % 3), STEP_MS)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!browser) return null

  const shareFirst = browser.safari && browser.menu
    ? 'Нажмите «⋯» справа внизу, затем «Поделиться»'
    : browser.safari && !browser.ipad
      ? 'Нажмите «Поделиться» внизу экрана'
      : 'Нажмите «Поделиться» в адресной строке'

  const steps = [
    { title: shareFirst, note: null, mock: <ToolbarMock menu={browser.safari && browser.menu} /> },
    { title: 'Выберите «На экран „Домой“»', note: 'Если пункта не видно — пролистайте список или нажмите «Ещё».', mock: <MenuMock /> },
    { title: 'Нажмите «Добавить»', note: 'Затем откройте «Блеск» с экрана «Домой» и включите уведомления.', mock: <AddMock /> },
  ]

  // Стрелка на кнопку браузера — только там, где мы знаем, где она.
  const arrow = browser.safari && !browser.ipad ? (browser.menu ? 'right' : 'center') : null

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center bg-navy/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="home-guide-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="relative w-full max-w-[30rem] rounded-t-[1.75rem] bg-white px-5 pt-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-navy shadow-[0_-20px_60px_rgba(14,26,53,.25)] motion-safe:animate-in motion-safe:slide-in-from-bottom-8 motion-safe:fade-in motion-safe:duration-300">
        <button type="button" onClick={onClose} aria-label="Закрыть" className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full text-slate transition hover:bg-mist hover:text-navy">
          <X className="h-5 w-5" />
        </button>

        <p className="label text-teal">Уведомления на iPhone</p>
        <h2 id="home-guide-title" className="mt-2 pr-10 font-display text-[1.375rem] leading-tight font-bold tracking-[-.02em]">
          Добавьте «Блеск» на&nbsp;экран «Домой»
        </h2>
        <p className="mt-2 text-[0.8125rem] leading-relaxed text-slate">
          iPhone присылает push только сайтам с экрана «Домой». Это займёт 10&nbsp;секунд.
        </p>

        <ol className="mt-5 grid gap-2.5">
          {steps.map((step, index) => {
            const on = index === active
            return (
              <li key={index}>
                <button type="button" data-on={on} onClick={() => setActive(index)} className={`group flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-[border-color,background-color] duration-300 ${on ? 'border-teal/40 bg-teal/[.06]' : 'border-line bg-white'}`}>
                  <div className="w-[7.5rem] shrink-0">{step.mock && <div className={on ? '' : 'opacity-55 transition-opacity'}>{step.mock}</div>}</div>
                  <div className="min-w-0">
                    <p className="flex items-baseline gap-2 font-display text-[0.9375rem] leading-snug font-bold">
                      <span className={`flex h-5 w-5 shrink-0 translate-y-[-1px] items-center justify-center rounded-full text-[0.6875rem] transition-colors ${on ? 'bg-teal text-white' : 'bg-mist text-slate'}`}>{index + 1}</span>
                      {step.title}
                    </p>
                    {step.note && <p className="mt-1 pl-7 text-[0.75rem] leading-relaxed text-slate">{step.note}</p>}
                  </div>
                </button>
              </li>
            )
          })}
        </ol>

        {arrow && (
          <div className={`pointer-events-none mt-4 flex ${arrow === 'center' ? 'justify-center' : 'justify-end pr-3'}`} aria-hidden="true">
            <span className="flex items-center gap-1.5 rounded-full bg-navy px-3.5 py-2 text-[0.75rem] font-bold text-white motion-safe:animate-[guide-nudge_1.4s_ease-in-out_infinite]">
              {arrow === 'center' ? <>Кнопка «Поделиться» здесь <ArrowDown className="h-4 w-4" /></> : <>Кнопка «⋯» здесь <ArrowDown className="h-4 w-4" /></>}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/** Кольцо-«нажатие» на элементе макета. */
const tap = 'relative after:absolute after:-inset-1 after:rounded-[inherit] after:ring-2 after:ring-teal group-data-[on=false]:after:hidden motion-safe:after:animate-[guide-tap_1.3s_ease-out_infinite]'

function ToolbarMock({ menu }: { menu: boolean }) {
  return (
    <div className="flex h-12 items-center justify-between rounded-xl bg-[#f2f2f7] px-2.5 text-[#007aff]">
      {menu ? (
        <>
          <span className="h-6 flex-1 rounded-full bg-white" />
          <span className={`ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-white ${tap}`}><Ellipsis className="h-4 w-4" /></span>
        </>
      ) : (
        <>
          <span className="h-1.5 w-3 rounded-full bg-[#007aff]/30" />
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tap}`}><Share className="h-4 w-4" /></span>
          <span className="h-1.5 w-3 rounded-full bg-[#007aff]/30" />
        </>
      )}
    </div>
  )
}

function MenuMock() {
  return (
    <div className="grid gap-1 rounded-xl bg-[#f2f2f7] p-1.5">
      <span className="h-3.5 rounded-md bg-white" />
      <span className={`flex h-6 items-center justify-between rounded-md bg-white px-1.5 text-[0.5625rem] font-semibold whitespace-nowrap text-black ${tap}`}>
        На экран «Домой» <SquarePlus className="h-3 w-3 shrink-0" />
      </span>
      <span className="h-3.5 rounded-md bg-white" />
    </div>
  )
}

function AddMock() {
  return (
    <div className="rounded-xl bg-[#f2f2f7] p-1.5">
      <div className="flex items-center justify-between px-0.5 text-[0.5625rem] text-[#007aff]">
        <span>Отменить</span>
        <span className={`rounded-md px-1 font-bold ${tap}`}>Добавить</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 rounded-md bg-white p-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/apple-icon.png" alt="" className="h-5 w-5 rounded-[5px]" />
        <span className="text-[0.625rem] font-semibold text-black">Блеск</span>
      </div>
    </div>
  )
}
