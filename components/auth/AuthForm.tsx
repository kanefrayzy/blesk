'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useId, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole } from 'lucide-react'

type Step = 'phone' | 'password'

const field =
  'h-14 w-full rounded-2xl border border-line bg-white px-4 text-[1rem] font-medium text-navy shadow-[0_4px_18px_rgba(14,26,53,.04)] ' +
  'placeholder:font-normal placeholder:text-slate-soft/75 transition focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10'

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '')
  const local = digits.startsWith('8') ? `7${digits.slice(1)}` : digits.startsWith('7') ? digits : `7${digits}`
  return `+${local.slice(0, 11)}`
}

function formatPhone(value: string) {
  const digits = normalizePhone(value).replace(/\D/g, '').slice(1)
  if (!digits) return '+7'
  const parts = ['+7']
  if (digits.length) parts.push(` (${digits.slice(0, 3)}`)
  if (digits.length >= 3) parts.push(')')
  if (digits.length > 3) parts.push(` ${digits.slice(3, 6)}`)
  if (digits.length > 6) parts.push(`-${digits.slice(6, 8)}`)
  if (digits.length > 8) parts.push(`-${digits.slice(8, 10)}`)
  return parts.join('')
}

async function api(path: string, body?: unknown) {
  const response = await fetch(`/api/v1/cabinet/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || 'Что-то пошло не так. Попробуйте ещё раз.')
  return payload
}

export function AuthForm() {
  const uid = useId()
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('+7')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/v1/cabinet/dashboard', { headers: { Accept: 'application/json' } }).then((response) => {
      if (response.ok) router.replace('/lk')
    })
  }, [router])

  const validPhone = /^\+7\d{10}$/.test(normalizePhone(phone))

  async function identify(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!validPhone) return setError('Введите российский номер телефона полностью.')
    if (!consent) return setError('Подтвердите согласие на обработку персональных данных.')

    setLoading(true)
    try {
      const result = await api('identify', { phone: normalizePhone(phone), consent })
      setIsNew(Boolean(result.is_new))
      setNotice(result.message)
      setStep('password')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось проверить номер.')
    } finally {
      setLoading(false)
    }
  }

  async function login(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (password.length < 4) return setError('Введите пароль или код из SMS.')

    setLoading(true)
    try {
      await api('login', { phone: normalizePhone(phone), password })
      router.replace('/lk')
      router.refresh()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось войти.')
    } finally {
      setLoading(false)
    }
  }

  async function remember() {
    setError('')
    setLoading(true)
    try {
      const result = await api('remember-password', { phone: normalizePhone(phone) })
      setNotice(result.message)
      setIsNew(true)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось отправить SMS.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[29rem]">
      <div className="mb-6 flex items-start justify-between sm:mb-8">
        <div>
          <p className="label text-teal">{step === 'phone' ? 'Вход' : 'Подтверждение'}</p>
          <h1 className="mt-3 font-display text-[1.75rem] leading-[1.06] font-bold tracking-[-.035em] text-navy sm:text-[2.35rem] xl:text-[2.75rem]">
            {step === 'phone' ? 'Войти по телефону' : isNew ? 'Проверьте SMS' : 'Введите пароль'}
          </h1>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream text-teal sm:h-12 sm:w-12 xl:bg-navy xl:text-white">
          <LockKeyhole className="h-5 w-5" />
        </div>
      </div>

      {step === 'phone' ? (
        <form onSubmit={identify} noValidate>
          <p className="mb-6 max-w-[40ch] text-[0.875rem] leading-relaxed text-slate sm:text-[0.9375rem]">
            Укажите номер, который оставляли при оформлении заказа. Если входите впервые — пришлём код в SMS.
          </p>
          <label htmlFor={`${uid}-phone`} className="label mb-2.5 block text-slate">Номер телефона</label>
          <input
            id={`${uid}-phone`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => { setPhone(formatPhone(event.target.value)); setError('') }}
            className={field}
            aria-invalid={Boolean(error) || undefined}
          />

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl bg-cream px-4 py-3.5 text-[0.75rem] leading-relaxed text-slate sm:mt-5 sm:text-[0.8125rem]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => { setConsent(event.target.checked); setError('') }}
              className="mt-0.5 h-4.5 w-4.5 shrink-0 accent-teal"
            />
            <span>
              Я даю{' '}
              <Link href="/soglasie-na-obrabotku-personalnyh-dannyh" target="_blank" className="font-semibold text-navy underline decoration-teal/50 underline-offset-3">
                согласие на обработку персональных данных
              </Link>{' '}
              для регистрации, входа и работы личного кабинета.
            </span>
          </label>

          {error && <p role="alert" className="mt-4 text-[0.8125rem] font-medium text-destructive">{error}</p>}

          <button disabled={loading} className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-teal px-6 font-display text-[0.9375rem] font-bold text-white shadow-[0_12px_34px_rgba(20,164,175,.24)] transition hover:bg-teal-hi disabled:opacity-60 sm:mt-6">
            {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <>Продолжить <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      ) : (
        <form onSubmit={login} noValidate>
          <button type="button" onClick={() => { setStep('phone'); setPassword(''); setError('') }} className="mb-6 inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-slate hover:text-navy">
            <ArrowLeft className="h-4 w-4" /> {phone}
          </button>

          {notice && (
            <div className="mb-6 flex gap-3 rounded-2xl border border-teal/20 bg-teal/6 px-4 py-3.5 text-[0.875rem] leading-relaxed text-navy">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal text-white"><Check className="h-3 w-3" /></span>
              {notice}
            </div>
          )}

          <label htmlFor={`${uid}-password`} className="label mb-2.5 block text-slate">{isNew ? 'Код-пароль из SMS' : 'Пароль'}</label>
          <div className="relative">
            <input
              id={`${uid}-password`}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(event) => { setPassword(event.target.value); setError('') }}
              className={`${field} pr-13`}
              placeholder="Введите пароль"
            />
            <button type="button" aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'} onClick={() => setShowPassword((value) => !value)} className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-soft hover:text-navy">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {error && <p role="alert" className="mt-4 text-[0.8125rem] font-medium text-destructive">{error}</p>}

          <button disabled={loading} className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-teal px-6 font-display text-[0.9375rem] font-bold text-white shadow-[0_12px_34px_rgba(20,164,175,.24)] transition hover:bg-teal-hi disabled:opacity-60">
            {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <>Открыть кабинет <ArrowRight className="h-4 w-4" /></>}
          </button>

          <button type="button" onClick={remember} disabled={loading} className="mx-auto mt-5 block text-[0.8125rem] font-semibold text-teal hover:text-navy disabled:opacity-50">
            Не помню пароль — прислать новый
          </button>
        </form>
      )}

      <p className="mt-7 border-t border-line pt-5 text-center text-[0.75rem] leading-relaxed text-slate sm:mt-9 sm:pt-6 sm:text-left sm:text-[0.8125rem]">
        Нужна помощь? <a href="tel:+79166959179" className="font-semibold text-navy">Позвоните нам: +7 (916) 695-91-79</a>
      </p>
    </div>
  )
}
