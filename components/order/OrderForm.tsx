'use client'

import { useId, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { IconArrow, IconCheck } from '@/components/ui/Icons'
import { reachGoal } from '@/lib/metrics'
import { contaminationOptions, orderServiceGroups } from '@/lib/order'

type State = 'idle' | 'sending' | 'success' | 'error'

const field =
  'mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-[0.9375rem] text-navy outline-none transition-[border-color,box-shadow] placeholder:text-slate-soft focus:border-teal focus:ring-3 focus:ring-teal/15'

export function OrderForm() {
  const uid = useId()
  const [state, setState] = useState<State>('idle')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const params = new URLSearchParams(window.location.search)

    setState('sending')

    try {
      const response = await fetch('/api/v1/order-requests', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          service: formData.get('service'),
          urgency: formData.get('urgency'),
          contamination_level: formData.get('contamination_level'),
          contamination_types: formData.getAll('contamination_types'),
          description: formData.get('description'),
          consent: formData.get('consent') === 'on',
          website: formData.get('website'),
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

      form.reset()
      setState('success')
      reachGoal('online_order_sent')
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="flex min-h-[26rem] flex-col items-center justify-center rounded-2xl bg-white px-6 py-12 text-center shadow-[0_18px_50px_rgba(14,26,53,0.12)]">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal text-white">
          <IconCheck className="h-8 w-8" />
        </span>
        <h3 className="h2 mt-6 text-2xl text-navy">Заявка отправлена</h3>
        <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-slate">
          Менеджер посмотрит выбранную услугу и свяжется с вами, чтобы уточнить детали и срок.
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="mt-7 rounded-full border border-line px-6 py-3 text-[0.875rem] font-semibold text-navy transition-colors hover:border-teal hover:text-teal"
        >
          Отправить ещё одну заявку
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl bg-white p-5 shadow-[0_18px_50px_rgba(14,26,53,0.12)] sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-[0.8125rem] font-semibold text-navy" htmlFor={`${uid}-name`}>
          Как вас зовут
          <input
            id={`${uid}-name`}
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            placeholder="Имя"
            className={field}
          />
        </label>

        <label className="text-[0.8125rem] font-semibold text-navy" htmlFor={`${uid}-phone`}>
          Номер телефона
          <input
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            maxLength={30}
            placeholder="+7 (___) ___-__-__"
            className={field}
          />
        </label>

        <label className="text-[0.8125rem] font-semibold text-navy" htmlFor={`${uid}-email`}>
          Электронная почта
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={160}
            placeholder="name@example.ru"
            className={field}
          />
        </label>

        <label className="text-[0.8125rem] font-semibold text-navy" htmlFor={`${uid}-service`}>
          Что нужно почистить
          <select id={`${uid}-service`} name="service" required defaultValue="" className={field}>
            <option value="" disabled>
              Выберите услугу
            </option>
            {orderServiceGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="mt-7">
        <legend className="text-[0.8125rem] font-semibold text-navy">Желаемый срок</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            ['standard', 'Без срочности', 'Обычный срок'],
            ['urgent_24h', 'Срочно', 'В течение суток'],
            ['express_3h', 'Очень срочно', 'В течение 3 часов'],
          ].map(([value, title, note], index) => (
            <label
              key={value}
              className="flex cursor-pointer gap-3 rounded-xl border border-line px-4 py-3 transition-colors has-checked:border-teal has-checked:bg-teal/5"
            >
              <input
                type="radio"
                name="urgency"
                value={value}
                defaultChecked={index === 0}
                className="mt-1 accent-teal"
              />
              <span>
                <b className="block text-[0.8125rem] text-navy">{title}</b>
                <small className="text-[0.75rem] text-slate">{note}</small>
              </span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-[0.75rem] text-slate-soft">
          Срочный срок является пожеланием. Возможность и стоимость менеджер подтвердит после
          осмотра изделия.
        </p>
      </fieldset>

      <fieldset className="mt-7">
        <legend className="text-[0.8125rem] font-semibold text-navy">Насколько загрязнена вещь</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ['normal', 'Обычное загрязнение'],
            ['heavy', 'Сильное загрязнение'],
            ['very_heavy', 'Очень сильное'],
          ].map(([value, label], index) => (
            <label
              key={value}
              className="cursor-pointer rounded-full border border-line px-4 py-2 text-[0.8125rem] text-slate transition-colors has-checked:border-teal has-checked:bg-teal has-checked:text-white"
            >
              <input
                type="radio"
                name="contamination_level"
                value={value}
                defaultChecked={index === 0}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-7">
        <legend className="text-[0.8125rem] font-semibold text-navy">Какие есть загрязнения</legend>
        <div className="mt-3 grid gap-x-5 gap-y-3 sm:grid-cols-2">
          {contaminationOptions.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-start gap-3 text-[0.8125rem] text-slate"
            >
              <input
                type="checkbox"
                name="contamination_types"
                value={option}
                className="mt-0.5 h-4 w-4 rounded accent-teal"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <label
        className="mt-7 block text-[0.8125rem] font-semibold text-navy"
        htmlFor={`${uid}-description`}
      >
        Что ещё важно знать
        <textarea
          id={`${uid}-description`}
          name="description"
          rows={4}
          maxLength={2000}
          placeholder="Опишите пятно, материал или другие особенности"
          className={`${field} h-auto resize-y py-3`}
        />
      </label>

      <label className="absolute -left-[10000px]" aria-hidden="true">
        Сайт
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <label className="mt-6 flex cursor-pointer items-start gap-3 text-[0.75rem] leading-relaxed text-slate">
        <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-teal" />
        <span>
          Я даю{' '}
          <Link
            href="/soglasie-na-obrabotku-personalnyh-dannyh"
            target="_blank"
            className="font-semibold text-teal underline underline-offset-2"
          >
            согласие на обработку персональных данных
          </Link>
          . Порядок обработки описан в{' '}
          <Link
            href="/politika-obrabotki-personalnyh-dannyh"
            target="_blank"
            className="font-semibold text-teal underline underline-offset-2"
          >
            Политике
          </Link>
          .
        </span>
      </label>

      {state === 'error' && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-[0.8125rem] text-red-700"
        >
          Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-teal px-7 font-display text-[0.875rem] font-bold tracking-wide text-white uppercase transition-[background-color,transform] hover:bg-teal-hi active:scale-[0.98] disabled:opacity-60 sm:w-auto"
      >
        {state === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
        {state !== 'sending' && <IconArrow className="h-4 w-4" />}
      </button>
    </form>
  )
}
