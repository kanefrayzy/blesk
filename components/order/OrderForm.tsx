'use client'

import Link from 'next/link'
import { useRef, useState, type FormEvent } from 'react'
import { IconArrow, IconCheck } from '@/components/ui/Icons'
import { reachGoal } from '@/lib/metrics'
import { contaminationOptions, orderServiceGroups } from '@/lib/order'

type RequestState = 'idle' | 'sending' | 'success' | 'error'

type Values = {
  name: string
  phone: string
  email: string
  service: string
  urgency: 'standard' | 'urgent_24h' | 'express_3h'
  contaminationLevel: 'normal' | 'heavy' | 'very_heavy'
  contaminationTypes: string[]
  description: string
  consent: boolean
  website: string
}

const emptyValues: Values = {
  name: '',
  phone: '',
  email: '',
  service: '',
  urgency: 'standard',
  contaminationLevel: 'normal',
  contaminationTypes: [],
  description: '',
  consent: false,
  website: '',
}

const field =
  'mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-[0.9375rem] text-navy outline-none transition-[border-color,box-shadow] placeholder:text-slate-soft hover:border-slate-soft focus:border-teal focus:ring-3 focus:ring-teal/15'

const steps = ['Контакты', 'Услуга', 'Детали'] as const

type OrderFormProps = {
  initialContact?: {
    name?: string | null
    phone?: string | null
    email?: string | null
  }
}

export function OrderForm({ initialContact }: OrderFormProps = {}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [step, setStep] = useState(0)
  const [requestState, setRequestState] = useState<RequestState>('idle')
  const [values, setValues] = useState<Values>(() => ({
    ...emptyValues,
    name: initialContact?.name ?? '',
    phone: initialContact?.phone ?? '',
    email: initialContact?.email ?? '',
  }))

  function resetForm() {
    setValues({
      ...emptyValues,
      name: initialContact?.name ?? '',
      phone: initialContact?.phone ?? '',
      email: initialContact?.email ?? '',
    })
    setStep(0)
    setRequestState('idle')
  }

  function next() {
    if (!formRef.current?.reportValidity()) return
    setStep((current) => Math.min(current + 1, steps.length - 1))
  }

  function toggleContamination(option: string) {
    setValues((current) => ({
      ...current,
      contaminationTypes: current.contaminationTypes.includes(option)
        ? current.contaminationTypes.filter((item) => item !== option)
        : [...current.contaminationTypes, option],
    }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return

    const params = new URLSearchParams(window.location.search)
    setRequestState('sending')

    try {
      const response = await fetch('/api/v1/order-requests', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          email: values.email,
          service: values.service,
          urgency: values.urgency,
          contamination_level: values.contaminationLevel,
          contamination_types: values.contaminationTypes,
          description: values.description,
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
      reachGoal('online_order_sent')
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
        <h3 className="h2 mt-3 text-[clamp(1.6rem,3vw,2.25rem)] text-navy">Заявка отправлена</h3>
        <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-slate">
          Менеджер посмотрит информацию и свяжется с вами, чтобы подтвердить срок и стоимость.
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="mt-8 rounded-full border border-line px-6 py-3 text-[0.8125rem] font-semibold text-navy transition-colors hover:border-teal hover:text-teal"
        >
          Новая заявка
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={submit} className="flex min-h-[31rem] flex-col p-5 sm:p-8 lg:p-10">
      <div className="flex items-center justify-between gap-5">
        <ol className="flex items-center gap-2" aria-label="Этапы заявки">
          {steps.map((label, index) => (
            <li key={label} className="flex items-center gap-2">
              <span
                aria-current={index === step ? 'step' : undefined}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[0.75rem] font-bold transition-colors ${
                  index < step
                    ? 'bg-teal text-white'
                    : index === step
                      ? 'bg-navy text-white'
                      : 'bg-mist text-slate-soft'
                }`}
              >
                {index < step ? <IconCheck className="h-4 w-4" /> : index + 1}
              </span>
              {index < steps.length - 1 && <span className="hidden h-px w-5 bg-line sm:block" />}
            </li>
          ))}
        </ol>
        <p className="text-[0.75rem] font-semibold text-slate-soft">
          {step + 1} / {steps.length}
        </p>
      </div>

      <div className="mt-6 h-1 overflow-hidden rounded-full bg-mist" aria-hidden="true">
        <span
          className="block h-full rounded-full bg-teal transition-[width] duration-300"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div key={step} className="rise-in mt-8 flex-1">
        {step === 0 && (
          <fieldset>
            <legend className="h2 text-[1.375rem] text-navy">Как с вами связаться?</legend>
            <p className="mt-2 text-[0.8125rem] text-slate">
              {initialContact?.phone ? 'Имя и телефон заполнены из вашего профиля.' : 'Оставьте контакты — без регистрации и оплаты.'}
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
                  onChange={(event) => setValues({ ...values, phone: event.target.value })}
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
          </fieldset>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="h2 text-[1.375rem] text-navy">Что нужно почистить?</legend>
            <p className="mt-2 text-[0.8125rem] text-slate">Выберите изделие и желаемый срок.</p>

            <label className="mt-6 block text-[0.8125rem] font-semibold text-navy">
              Изделие или услуга
              <select
                name="service"
                required
                value={values.service}
                onChange={(event) => setValues({ ...values, service: event.target.value })}
                className={field}
              >
                <option value="" disabled>
                  Выберите из списка
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

            <div className="mt-7 grid gap-2 sm:grid-cols-3">
              {[
                ['standard', 'Без срочности', 'Обычный срок'],
                ['urgent_24h', 'Срочно', 'До суток'],
                ['express_3h', 'Очень срочно', 'До 3 часов'],
              ].map(([value, title, note]) => (
                <label
                  key={value}
                  className="cursor-pointer rounded-xl border border-line px-4 py-3 transition-colors has-checked:border-teal has-checked:bg-teal/5"
                >
                  <input
                    type="radio"
                    name="urgency"
                    value={value}
                    checked={values.urgency === value}
                    onChange={() => setValues({ ...values, urgency: value as Values['urgency'] })}
                    className="sr-only"
                  />
                  <b className="block text-[0.8125rem] text-navy">{title}</b>
                  <small className="mt-0.5 block text-[0.75rem] text-slate">{note}</small>
                </label>
              ))}
            </div>
            <p className="mt-3 text-[0.75rem] leading-relaxed text-slate-soft">
              Возможность срочной чистки и стоимость менеджер подтвердит после осмотра изделия.
            </p>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="h2 text-[1.375rem] text-navy">Что случилось с вещью?</legend>
            <p className="mt-2 text-[0.8125rem] text-slate">
              Можно выбрать несколько вариантов или сразу отправить заявку.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                ['normal', 'Обычное'],
                ['heavy', 'Сильное'],
                ['very_heavy', 'Очень сильное'],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="cursor-pointer rounded-full border border-line px-4 py-2 text-[0.8125rem] text-slate transition-colors has-checked:border-navy has-checked:bg-navy has-checked:text-white"
                >
                  <input
                    type="radio"
                    name="contamination_level"
                    value={value}
                    checked={values.contaminationLevel === value}
                    onChange={() =>
                      setValues({
                        ...values,
                        contaminationLevel: value as Values['contaminationLevel'],
                      })
                    }
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {contaminationOptions.map((option) => (
                <label
                  key={option}
                  className="cursor-pointer rounded-full border border-line bg-white px-3.5 py-2 text-[0.75rem] text-slate transition-colors has-checked:border-teal has-checked:bg-teal/5 has-checked:text-navy"
                >
                  <input
                    type="checkbox"
                    name="contamination_types"
                    value={option}
                    checked={values.contaminationTypes.includes(option)}
                    onChange={() => toggleContamination(option)}
                    className="sr-only"
                  />
                  {option}
                </label>
              ))}
            </div>

            <label className="mt-5 block text-[0.8125rem] font-semibold text-navy">
              Комментарий <span className="font-normal text-slate-soft">— необязательно</span>
              <textarea
                name="description"
                rows={3}
                maxLength={2000}
                value={values.description}
                onChange={(event) => setValues({ ...values, description: event.target.value })}
                placeholder="Например: пятно от кофе на рукаве"
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
        )}
      </div>

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
          Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="h-11 rounded-full px-4 text-[0.8125rem] font-semibold text-slate transition-colors hover:text-navy"
          >
            Назад
          </button>
        ) : (
          <span />
        )}

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-navy px-6 font-display text-[0.8125rem] font-bold tracking-wide text-white uppercase transition-[background-color,transform] hover:bg-navy-2 active:scale-[0.98]"
          >
            Продолжить
            <IconArrow className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={requestState === 'sending'}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-teal px-6 font-display text-[0.8125rem] font-bold tracking-wide text-white uppercase transition-[background-color,transform] hover:bg-teal-hi active:scale-[0.98] disabled:opacity-60"
          >
            {requestState === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
            {requestState !== 'sending' && <IconArrow className="h-4 w-4" />}
          </button>
        )}
      </div>
    </form>
  )
}
