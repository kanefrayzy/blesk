'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { IconArrow, IconCheck, IconChevron } from '@/components/ui/Icons'
import { VACANCY_PICK } from '@/components/vacancy/ApplyButton'
import { reachGoal } from '@/lib/metrics'
import { checkPhone } from '@/lib/phone'
import { vacancies } from '@/lib/vacanciesPage'

type RequestState = 'idle' | 'sending' | 'success' | 'error'

const emptyValues = {
  name: '',
  phone: '',
  email: '',
  vacancy: '',
  about: '',
  consent: false,
  website: '',
}

const field =
  'mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-[0.9375rem] text-navy outline-none transition-[border-color,box-shadow] placeholder:text-slate-soft hover:border-slate-soft focus:border-teal focus:ring-3 focus:ring-teal/15'

export function VacancyForm() {
  const [requestState, setRequestState] = useState<RequestState>('idle')
  const [values, setValues] = useState(emptyValues)

  // Кнопка «Откликнуться» у должности подставляет её в список.
  useEffect(() => {
    const onPick = (event: Event) => {
      const vacancy = (event as CustomEvent<string>).detail
      setValues((current) => ({ ...current, vacancy }))
    }
    window.addEventListener(VACANCY_PICK, onPick)
    return () => window.removeEventListener(VACANCY_PICK, onPick)
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return

    const params = new URLSearchParams(window.location.search)
    setRequestState('sending')

    try {
      // Отдельного адреса для откликов на сервере нет: уходит обычной заявкой с пометкой в теме.
      const response = await fetch('/api/v1/order-requests', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          email: values.email,
          service: `Вакансии: ${values.vacancy}`,
          urgency: 'standard',
          contamination_level: 'normal',
          contamination_types: [],
          description: values.about,
          consent: values.consent,
          website: values.website,
          page_url: window.location.href,
          referrer: document.referrer || null,
          utm_source: params.get('utm_source'),
          utm_medium: params.get('utm_medium'),
          utm_campaign: params.get('utm_campaign'),
          utm_content: params.get('utm_content'),
          utm_term: params.get('utm_term'),
          yclid: params.get('yclid'),
        }),
      })

      if (!response.ok) throw new Error('request_failed')

      setRequestState('success')
      reachGoal('vacancy_response_sent')
    } catch {
      setRequestState('error')
    }
  }

  if (requestState === 'success') {
    return (
      <div className="flex min-h-[28rem] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal text-white shadow-[0_12px_30px_rgba(20,164,175,0.25)]">
          <IconCheck className="h-8 w-8" />
        </span>
        <p className="label mt-7 text-teal">Готово</p>
        <h3 className="h2 mt-3 text-[clamp(1.6rem,3vw,2.25rem)] text-navy">Отклик отправлен</h3>
        <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-slate">
          Свяжемся с вами и договоримся о собеседовании.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="relative flex flex-col p-5 sm:p-8 lg:p-10">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-[0.8125rem] font-semibold text-navy sm:col-span-2">
          Вакансия
          <span className="relative block">
            <select
              name="vacancy"
              required
              value={values.vacancy}
              onChange={(event) => setValues({ ...values, vacancy: event.target.value })}
              className={`${field} appearance-none pr-11`}
            >
              <option value="" disabled>
                Выберите должность
              </option>
              {vacancies.map((v) => (
                <option key={v.key} value={v.title}>
                  {v.title}
                </option>
              ))}
            </select>
            <IconChevron className="pointer-events-none absolute top-1/2 right-4 mt-1 h-4 w-4 -translate-y-1/2 rotate-90 text-navy" />
          </span>
        </label>

        <label className="text-[0.8125rem] font-semibold text-navy sm:col-span-2">
          Как вас зовут
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            value={values.name}
            onChange={(event) => setValues({ ...values, name: event.target.value })}
            placeholder="Имя"
            className={field}
          />
        </label>

        <label className="text-[0.8125rem] font-semibold text-navy">
          Номер телефона
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            maxLength={30}
            value={values.phone}
            onChange={(event) => {
              checkPhone(event.target)
              setValues({ ...values, phone: event.target.value })
            }}
            placeholder="+7 (___) ___-__-__"
            className={field}
          />
        </label>

        <label className="text-[0.8125rem] font-semibold text-navy">
          Электронная почта
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={160}
            value={values.email}
            onChange={(event) => setValues({ ...values, email: event.target.value })}
            placeholder="name@example.ru"
            className={field}
          />
        </label>
      </div>

      <label className="mt-5 block text-[0.8125rem] font-semibold text-navy">
        О себе <span className="font-normal text-slate-soft">— необязательно</span>
        <textarea
          name="about"
          rows={3}
          maxLength={2000}
          value={values.about}
          onChange={(event) => setValues({ ...values, about: event.target.value })}
          placeholder="Например: где работали раньше и когда готовы выйти"
          className={`${field} h-auto resize-y py-3`}
        />
      </label>

      <label className="mt-5 flex cursor-pointer items-start gap-3 text-[0.75rem] leading-relaxed text-slate">
        <input
          name="consent"
          type="checkbox"
          required
          checked={values.consent}
          onChange={(event) => setValues({ ...values, consent: event.target.checked })}
          className="mt-1 h-4 w-4 shrink-0 accent-teal"
        />
        <span>
          Я даю{' '}
          <Link
            href="/soglasie-na-obrabotku-personalnyh-dannyh"
            target="_blank"
            className="font-semibold text-teal underline underline-offset-2"
          >
            согласие на обработку данных
          </Link>{' '}
          и ознакомился с{' '}
          <Link
            href="/politika-obrabotki-personalnyh-dannyh"
            target="_blank"
            className="font-semibold text-teal underline underline-offset-2"
          >
            Политикой
          </Link>
          .
        </span>
      </label>

      <label className="absolute -left-[10000px]" aria-hidden="true">
        Сайт
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => setValues({ ...values, website: event.target.value })}
        />
      </label>

      {requestState === 'error' && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-[0.8125rem] text-red-700">
          Не удалось отправить отклик. Попробуйте ещё раз или позвоните нам.
        </p>
      )}

      <div className="mt-8 flex justify-end border-t border-line pt-6">
        <button
          type="submit"
          disabled={requestState === 'sending'}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-teal px-6 font-display text-[0.8125rem] font-bold tracking-wide text-white uppercase transition-[background-color,transform] hover:bg-teal-hi active:scale-[0.98] disabled:opacity-60"
        >
          {requestState === 'sending' ? 'Отправляем…' : 'Отправить отклик'}
          {requestState !== 'sending' && <IconArrow className="h-4 w-4" />}
        </button>
      </div>
    </form>
  )
}
