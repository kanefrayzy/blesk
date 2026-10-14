'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { IconArrow, IconCheck } from '@/components/ui/Icons'
import { reachGoal } from '@/lib/metrics'
import { checkPhone } from '@/lib/phone'

type RequestState = 'idle' | 'sending' | 'success' | 'error'

const terms = ['В течение суток', '2–3 дня', 'До недели', 'Обсудим отдельно'] as const

const emptyValues = {
  company: '',
  name: '',
  phone: '',
  email: '',
  monthly: '',
  minimum: '',
  term: '',
  logistics: 'pickup' as 'pickup' | 'self',
  address: '',
  comment: '',
  consent: false,
  website: '',
}

const field =
  'mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-[0.9375rem] text-navy outline-none transition-[border-color,box-shadow] placeholder:text-slate-soft hover:border-slate-soft focus:border-teal focus:ring-3 focus:ring-teal/15'

const label = 'text-[0.8125rem] font-semibold text-navy'

export function BusinessForm() {
  const [requestState, setRequestState] = useState<RequestState>('idle')
  const [values, setValues] = useState(emptyValues)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const phone = event.currentTarget.elements.namedItem('phone')
    if (phone instanceof HTMLInputElement) checkPhone(phone)
    if (!event.currentTarget.reportValidity()) return

    const params = new URLSearchParams(window.location.search)
    setRequestState('sending')

    const description = [
      `Организация: ${values.company}`,
      `Позиций в месяц: ${values.monthly}`,
      `Минимальный объём за раз: ${values.minimum}`,
      `Срок готовности: ${values.term}`,
      values.logistics === 'pickup'
        ? `Забор и доставка силами химчистки. Адрес: ${values.address}`
        : 'Привозят и забирают сами',
      values.comment && `Комментарий: ${values.comment}`,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      const response = await fetch('/api/v1/order-requests', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          email: values.email,
          service: 'Для бизнеса: коммерческое предложение',
          urgency: 'standard',
          contamination_level: 'normal',
          contamination_types: [],
          description,
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
      reachGoal('click')
      reachGoal('business_request_sent')
    } catch {
      setRequestState('error')
    }
  }

  if (requestState === 'success') {
    return (
      <div className="flex min-h-[31rem] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal text-white shadow-[0_12px_30px_rgba(20,164,175,0.25)]">
          <IconCheck className="h-8 w-8" />
        </span>
        <p className="label mt-7 text-teal">Готово</p>
        <h3 className="h2 mt-3 text-[clamp(1.6rem,3vw,2.25rem)] text-navy">Запрос отправлен</h3>
        <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-slate">
          Посчитаем условия под ваш объём и свяжемся, чтобы обсудить коммерческое предложение.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="relative flex flex-col p-5 sm:p-8 lg:p-10">
      <fieldset>
        <legend className="h2 text-[1.375rem] text-navy">Получить коммерческое предложение</legend>
        <p className="mt-2 text-[0.8125rem] text-slate">Все поля, кроме комментария, обязательны.</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className={label}>
            Наименование организации
            <input
              name="company"
              autoComplete="organization"
              required
              maxLength={160}
              value={values.company}
              onChange={(event) => setValues({ ...values, company: event.target.value })}
              placeholder="ООО «Ресторан»"
              className={field}
            />
          </label>

          <label className={label}>
            Контактное лицо
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

          <label className={label}>
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

          <label className={label}>
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
              placeholder="name@company.ru"
              className={field}
            />
          </label>

          <label className={label}>
            Сколько позиций сдаёте в месяц
            <input
              name="monthly"
              required
              maxLength={160}
              value={values.monthly}
              onChange={(event) => setValues({ ...values, monthly: event.target.value })}
              placeholder="Например: 200 скатертей, 40 комплектов формы"
              className={field}
            />
          </label>

          <label className={label}>
            Минимальный объём за один раз
            <input
              name="minimum"
              required
              maxLength={160}
              value={values.minimum}
              onChange={(event) => setValues({ ...values, minimum: event.target.value })}
              placeholder="Например: 30 кг или 50 позиций"
              className={field}
            />
          </label>

          <label className={`${label} sm:col-span-2`}>
            Минимальный срок готовности
            <select
              name="term"
              required
              value={values.term}
              onChange={(event) => setValues({ ...values, term: event.target.value })}
              className={field}
            >
              <option value="" disabled>
                Выберите срок
              </option>
              {terms.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className={`${label} mt-6`}>Как передаёте вещи</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {[
            ['pickup', 'Забор и доставка', 'Приедем за вещами и привезём обратно'],
            ['self', 'Своими силами', 'Привозите и забираете сами'],
          ].map(([value, title, note]) => (
            <label
              key={value}
              className="cursor-pointer rounded-xl border border-line px-4 py-3 transition-colors has-checked:border-teal has-checked:bg-teal/5"
            >
              <input
                type="radio"
                name="logistics"
                value={value}
                checked={values.logistics === value}
                onChange={() => setValues({ ...values, logistics: value as 'pickup' | 'self' })}
                className="sr-only"
              />
              <b className="block text-[0.8125rem] text-navy">{title}</b>
              <small className="mt-0.5 block text-[0.75rem] text-slate">{note}</small>
            </label>
          ))}
        </div>

        {values.logistics === 'pickup' && (
          <label className={`${label} mt-5 block`}>
            Адрес забора вещей
            <input
              name="address"
              autoComplete="street-address"
              required
              maxLength={300}
              value={values.address}
              onChange={(event) => setValues({ ...values, address: event.target.value })}
              placeholder="Город, улица, дом"
              className={field}
            />
          </label>
        )}

        <label className={`${label} mt-5 block`}>
          Комментарий <span className="font-normal text-slate-soft">— необязательно</span>
          <textarea
            name="comment"
            rows={3}
            maxLength={800}
            value={values.comment}
            onChange={(event) => setValues({ ...values, comment: event.target.value })}
            placeholder="Например: нужна стирка формы по понедельникам"
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
      </fieldset>

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
          Не удалось отправить запрос. Попробуйте ещё раз или позвоните нам.
        </p>
      )}

      <div className="mt-8 flex justify-end border-t border-line pt-6">
        <button
          type="submit"
          disabled={requestState === 'sending'}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-teal px-6 font-display text-[0.8125rem] font-bold tracking-wide text-white uppercase transition-[background-color,transform] hover:bg-teal-hi active:scale-[0.98] disabled:opacity-60"
        >
          {requestState === 'sending' ? 'Отправляем…' : 'Получить предложение'}
          {requestState !== 'sending' && <IconArrow className="h-4 w-4" />}
        </button>
      </div>
    </form>
  )
}
