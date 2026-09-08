'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useId, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, RefreshCw } from 'lucide-react'

type Step = 'phone' | 'password'
type CodeMode = 'register' | 'reset' | null
type Captcha = { token: string; image: string } | null

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

type ApiError = Error & { retryCaptcha?: boolean }

async function api(path: string, body?: unknown) {
  const response = await fetch(`/api/v1/cabinet/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error: ApiError = new Error(payload.message || 'Что-то пошло не так. Попробуйте ещё раз.')
    error.retryCaptcha = Boolean(payload.retry_captcha)
    throw error
  }
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

  // Запрос кода закрыт капчей: AGBIS отдаёт картинку и одноразовую метку,
  // метка живёт пять минут и сгорает после первой проверки.
  const [codeMode, setCodeMode] = useState<CodeMode>(null)
  const [captcha, setCaptcha] = useState<Captcha>(null)
  const [captchaValue, setCaptchaValue] = useState('')
  const [captchaLoading, setCaptchaLoading] = useState(false)

  async function refreshCaptcha() {
    setCaptchaLoading(true)
    setCaptchaValue('')
    try {
      const result = await api('captcha')
      setCaptcha({ token: result.token, image: result.image })
    } catch (reason) {
      setCaptcha(null)
      setError(reason instanceof Error ? reason.message : 'Не удалось загрузить картинку с кодом.')
    } finally {
      setCaptchaLoading(false)
    }
  }

  async function openCodeForm(mode: Exclude<CodeMode, null>) {
    setError('')
    setNotice('')
    setCodeMode(mode)
    await refreshCaptcha()
  }

  async function sendCode(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!captcha) return
    if (!captchaValue.trim()) return setError('Введите код с картинки.')

    setLoading(true)
    try {
      const result = await api('send-code', {
        phone: normalizePhone(phone),
        captcha_token: captcha.token,
        captcha_value: captchaValue.trim(),
        mode: codeMode === 'reset' ? 'reset' : 'register',
        consent: true,
      })
      setNotice(result.message)
      setIsNew(result.state === 'sent')
      setCodeMode(null)
      setCaptcha(null)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось отправить код.')
      // Метка сгорает при любой проверке — берём новую картинку.
      if ((reason as ApiError)?.retryCaptcha !== false) await refreshCaptcha()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch('/api/v1/cabinet/dashboard', { headers: { Accept: 'application/json' } }).then((response) => {
      if (response.ok) router.replace('/lk')
    })
  }, [router])

  const validPhone = /^\+7\d{10}$/.test(normalizePhone(phone))

  function submitPhone(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!validPhone) return setError('Введите российский номер телефона полностью.')
    if (!consent) return setError('Подтвердите согласие на обработку персональных данных.')

    setNotice('')
    setStep('password')
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

  return (
    <div className="w-full max-w-[29rem]">
      <div className="mb-6 flex items-start justify-between sm:mb-8">
        <div>
          <p className="label text-teal">{step === 'phone' ? 'Вход' : 'Подтверждение'}</p>
          <h1 className="mt-3 font-display text-[1.75rem] leading-[1.06] font-bold tracking-[-.035em] text-navy sm:text-[2.35rem] xl:text-[2.75rem]">
            {step === 'phone'
              ? 'Войти по телефону'
              : codeMode
                ? 'Подтвердите, что вы человек'
                : isNew
                  ? 'Проверьте SMS'
                  : 'Введите пароль'}
          </h1>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream text-teal sm:h-12 sm:w-12 xl:bg-navy xl:text-white">
          <LockKeyhole className="h-5 w-5" />
        </div>
      </div>

      {step === 'phone' ? (
        <form onSubmit={submitPhone} noValidate>
          <p className="mb-6 max-w-[40ch] text-[0.875rem] leading-relaxed text-slate sm:text-[0.9375rem]">
            Укажите номер, который оставляли при оформлении заказа. Если входите впервые, на следующем шаге пришлём код в SMS.
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
      ) : codeMode ? (
        <form onSubmit={sendCode} noValidate>
          <button type="button" onClick={() => { setCodeMode(null); setCaptcha(null); setError('') }} className="mb-6 inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-slate hover:text-navy">
            <ArrowLeft className="h-4 w-4" /> Назад ко входу
          </button>

          <p className="mb-6 max-w-[40ch] text-[0.875rem] leading-relaxed text-slate sm:text-[0.9375rem]">
            {codeMode === 'reset'
              ? 'Пришлём новый пароль в SMS на ' + phone + '. Подтвердите, что вы не робот.'
              : 'Пришлём код-пароль в SMS на ' + phone + '. Подтвердите, что вы не робот.'}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex h-[4.5rem] w-[11rem] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-white">
              {captchaLoading || !captcha ? (
                <LoaderCircle className="h-5 w-5 animate-spin text-slate-soft" />
              ) : (
                /* Картинку рисует AGBIS, размеры её неизвестны — вписываем целиком. */
                // eslint-disable-next-line @next/next/no-img-element
                <img src={captcha.image} alt="Код с картинки" className="h-full w-full object-contain" />
              )}
            </div>
            <button type="button" onClick={refreshCaptcha} disabled={captchaLoading} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line text-slate transition hover:border-teal hover:text-teal disabled:opacity-50" aria-label="Другая картинка">
              <RefreshCw className={`h-4 w-4 ${captchaLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <label htmlFor={`${uid}-captcha`} className="label mt-5 mb-2.5 block text-slate">Код с картинки</label>
          <input
            id={`${uid}-captcha`}
            autoComplete="off"
            autoFocus
            value={captchaValue}
            onChange={(event) => { setCaptchaValue(event.target.value); setError('') }}
            className={field}
            placeholder="Введите символы"
          />

          {error && <p role="alert" className="mt-4 text-[0.8125rem] font-medium text-destructive">{error}</p>}

          <button disabled={loading || captchaLoading || !captcha} className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-teal px-6 font-display text-[0.9375rem] font-bold text-white shadow-[0_12px_34px_rgba(20,164,175,.24)] transition hover:bg-teal-hi disabled:opacity-60">
            {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <>Прислать SMS <ArrowRight className="h-4 w-4" /></>}
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

          <div className="mt-5 flex flex-col items-center gap-2.5 sm:flex-row sm:justify-center sm:gap-5">
            <button type="button" onClick={() => openCodeForm('register')} disabled={loading} className="text-[0.8125rem] font-semibold text-teal hover:text-navy disabled:opacity-50">
              Вхожу впервые — прислать код
            </button>
            <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-slate-soft/40 sm:block" />
            <button type="button" onClick={() => openCodeForm('reset')} disabled={loading} className="text-[0.8125rem] font-semibold text-slate hover:text-navy disabled:opacity-50">
              Не помню пароль
            </button>
          </div>
        </form>
      )}

      <p className="mt-7 border-t border-line pt-5 text-center text-[0.75rem] leading-relaxed text-slate sm:mt-9 sm:pt-6 sm:text-left sm:text-[0.8125rem]">
        Нужна помощь? <a href="tel:+79166959179" className="font-semibold text-navy">Позвоните нам: +7 (916) 695-91-79</a>
      </p>
    </div>
  )
}
