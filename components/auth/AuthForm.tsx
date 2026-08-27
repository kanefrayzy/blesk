'use client'

import { useId, useState } from 'react'
import { IconArrow, IconCheck } from '@/components/ui/Icons'
import { org, pending } from '@/lib/content'

type Mode = 'login' | 'register'
type Errors = Partial<Record<'name' | 'phone' | 'email' | 'password' | 'consent', string>>

const digits = (v: string) => v.replace(/\D/g, '')
const okPhone = (v: string) => /^[78]\d{10}$/.test(digits(v))
const okEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

const field =
  'h-12 w-full rounded-xl border border-line bg-white px-4 text-[0.9375rem] text-navy ' +
  'transition-[border-color,box-shadow] duration-200 placeholder:text-slate-soft ' +
  'hover:border-slate-soft focus:border-teal focus:shadow-[0_0_0_3px_rgba(20,164,175,0.14)] focus:outline-none'

/**
 * Вход и регистрация в личный кабинет.
 *
 * Форма не подключена: по стратегии кабинет живёт в АГБИС, а какие функции
 * доступны через его API — вопрос 15 к учредителю, ответа пока нет. Поэтому
 * проверка полей работает по-настоящему, а отправки нет, и об этом сказано
 * и до отправки, и после неё.
 */
export function AuthForm() {
  const uid = useId()
  const [mode, setMode] = useState<Mode>('login')
  const [values, setValues] = useState({ name: '', phone: '', email: '', password: '' })
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    setErrors((x) => ({ ...x, [k]: undefined }))
    setSent(false)
  }

  const switchTo = (m: Mode) => {
    setMode(m)
    setErrors({})
    setSent(false)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Errors = {}
    if (!okPhone(values.phone)) next.phone = 'Введите номер телефона из 11 цифр'
    if (values.password.length < 8) next.password = 'Не короче 8 символов'
    if (mode === 'register') {
      if (values.name.trim().length < 2) next.name = 'Как к вам обращаться?'
      if (!okEmail(values.email)) next.email = 'Проверьте адрес почты'
      if (!consent) next.consent = 'Без согласия мы не сможем завести кабинет'
    }
    setErrors(next)
    if (Object.keys(next).length) return
    // Отправлять некуда: бэкенда нет. Введённое остаётся в состоянии формы.
    setSent(true)
  }

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`${uid}-${k}-err`} role="alert" className="mt-1.5 text-[0.8125rem] text-destructive">
        {errors[k]}
      </p>
    ) : null

  const aria = (k: keyof Errors) => ({
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `${uid}-${k}-err` : undefined,
  })

  return (
    <div className="w-full max-w-[27rem]">
      <p className="rounded-xl border border-dashed border-slate-soft/50 bg-mist/60 px-4 py-3 text-[0.8125rem] leading-snug text-slate">
        <span className="mr-1.5 inline-block rounded border border-dashed border-slate-soft/60 px-1.5 py-0.5 align-[0.1em] text-[0.625rem] leading-none tracking-wider uppercase">
          Заглушка
        </span>
        Кабинет ещё не подключён к системе учёта заказов. Форма готова, но данные никуда не
        отправляются.
      </p>

      <div
        role="tablist"
        aria-label="Вход или регистрация"
        className="mt-7 grid grid-cols-2 gap-1 rounded-full bg-mist p-1"
      >
        {(
          [
            ['login', 'Вход'],
            ['register', 'Регистрация'],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            role="tab"
            type="button"
            id={`${uid}-tab-${m}`}
            aria-selected={mode === m}
            aria-controls={`${uid}-panel`}
            onClick={() => switchTo(m)}
            className={`h-10 rounded-full font-display text-[0.875rem] font-bold transition-[background-color,color,box-shadow] duration-200 ${
              mode === m
                ? 'bg-white text-navy shadow-[0_2px_8px_rgba(14,26,53,0.10)]'
                : 'text-slate hover:text-navy'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${mode}`}
        onSubmit={submit}
        noValidate
        className="mt-7"
      >
        {mode === 'register' && (
          <div className="mb-4">
            <label htmlFor={`${uid}-name`} className="label mb-2 block text-slate">
              Имя
            </label>
            <input
              id={`${uid}-name`}
              name="name"
              autoComplete="name"
              value={values.name}
              onChange={set('name')}
              placeholder="Как к вам обращаться"
              className={field}
              {...aria('name')}
            />
            {err('name')}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor={`${uid}-phone`} className="label mb-2 block text-slate">
            Телефон
          </label>
          <input
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={set('phone')}
            placeholder="+7 (900) 000-00-00"
            className={field}
            {...aria('phone')}
          />
          {err('phone')}
        </div>

        {mode === 'register' && (
          <div className="mb-4">
            <label htmlFor={`${uid}-email`} className="label mb-2 block text-slate">
              Почта
            </label>
            <input
              id={`${uid}-email`}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              onChange={set('email')}
              placeholder="you@example.com"
              className={field}
              {...aria('email')}
            />
            {err('email')}
          </div>
        )}

        <div className="mb-4">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <label htmlFor={`${uid}-password`} className="label text-slate">
              Пароль
            </label>
            {mode === 'login' && (
              <span className="text-[0.75rem] text-slate-soft">
                Восстановление появится вместе с кабинетом
              </span>
            )}
          </div>
          <input
            id={`${uid}-password`}
            name="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={values.password}
            onChange={set('password')}
            placeholder="Не короче 8 символов"
            className={field}
            {...aria('password')}
          />
          {err('password')}
        </div>

        {mode === 'register' && (
          <div className="mb-5">
            <label className="flex cursor-pointer items-start gap-3 text-[0.8125rem] leading-snug text-slate">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked)
                  setErrors((x) => ({ ...x, consent: undefined }))
                }}
                className="mt-0.5 h-4.5 w-4.5 shrink-0 accent-teal"
                {...aria('consent')}
              />
              <span>
                Согласен на обработку персональных данных. Сама {pending.privacy} будет
                опубликована до запуска кабинета.
              </span>
            </label>
            {err('consent')}
          </div>
        )}

        <button
          type="submit"
          className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-teal font-display text-[0.875rem] font-bold text-white shadow-[0_10px_28px_rgba(17,184,194,0.24)] transition-[background-color,transform,box-shadow] duration-200 hover:bg-teal-hi hover:shadow-[0_12px_34px_rgba(17,184,194,0.34)] active:scale-[0.98]"
        >
          {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          <IconArrow className="h-4 w-4" />
        </button>

        {sent && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-teal/30 bg-teal/8 px-4 py-4 text-[0.8125rem] leading-relaxed text-navy"
          >
            <p className="flex items-center gap-2 font-display text-[0.875rem] font-bold">
              <IconCheck className="h-4 w-4 text-teal" />
              Поля заполнены верно
            </p>
            <p className="mt-2 text-slate">
              Кабинет ещё не подключён к системе учёта, поэтому введённое никуда не отправлено и
              нигде не сохранено. Статус заказа сейчас подскажут по телефону.
            </p>
            <a
              href={org.phones[0].href}
              className="mt-3 inline-flex items-center gap-1.5 font-display text-[0.875rem] font-bold text-teal"
            >
              {org.phones[0].display}
              <IconArrow className="h-4 w-4" />
            </a>
          </div>
        )}
      </form>

      <p className="mt-8 border-t border-line pt-6 text-[0.8125rem] leading-relaxed text-slate">
        Нужен статус заказа прямо сейчас? Позвоните{' '}
        <a href={org.phones[0].href} className="font-semibold text-teal">
          {org.phones[0].display}
        </a>{' '}
        или напишите на{' '}
        <a href={`mailto:${org.email}`} className="font-semibold text-teal">
          {org.email}
        </a>
        .
      </p>
    </div>
  )
}
