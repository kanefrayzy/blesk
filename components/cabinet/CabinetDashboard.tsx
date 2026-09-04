'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  Bell,
  Camera,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  History,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Package,
  RefreshCw,
  Settings,
  Shirt,
  Sparkles,
} from 'lucide-react'

type PublicStatus = { code: 'ready' | 'in_work'; label: string }
type Detail = { label: string; value: string }
type Photo = { id: string; service_id: string }
type OrderItem = { id: string; name: string; status: PublicStatus; price: number; discount: number; details: Detail[]; photos: Photo[] }
type Order = { id: string; number: string; created_at: string; ready_at: string; status: PublicStatus; amount: number; paid: number; pickup: string; items: OrderItem[] }
type Dashboard = {
  profile: { name: string | null; phone: string; promo_code: string | null }
  orders: Order[]
  history: Order[]
  preferences: { email: string | null; email_notifications: boolean; push_notifications: boolean }
}
type View = 'orders' | 'history' | 'settings'

function money(value: number) {
  if (value <= 0) return 'Уточняется'
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value)
}

function firstName(name: string | null) {
  if (!name) return null
  return name.trim().split(/\s+/)[0]
}

function applicationServerKey(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const bytes = atob(base64)
  return Uint8Array.from(bytes, (character) => character.charCodeAt(0))
}

async function updatePushSubscription(enabled: boolean) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Этот браузер не поддерживает push-уведомления.')
  }

  const registration = await navigator.serviceWorker.register('/sw.js')
  const current = await registration.pushManager.getSubscription()

  if (!enabled) {
    if (current) {
      await fetch('/api/v1/cabinet/push/subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ endpoint: current.endpoint }),
      })
      await current.unsubscribe()
    }
    return
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Разрешите уведомления в настройках браузера.')

  const configResponse = await fetch('/api/v1/cabinet/push/config', { headers: { Accept: 'application/json' } })
  const config = await configResponse.json().catch(() => ({}))
  if (!configResponse.ok) throw new Error(config.message || 'Push-уведомления пока недоступны.')

  const subscription = current ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey(config.public_key),
  })
  const serialized = subscription.toJSON()
  const response = await fetch('/api/v1/cabinet/push/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...serialized, content_encoding: 'aes128gcm' }),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.message || 'Не удалось включить push-уведомления.')
}

function StatusPill({ status }: { status: PublicStatus }) {
  const ready = status.code === 'ready'
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.75rem] font-bold ${ready ? 'bg-teal/10 text-teal' : 'bg-bone/65 text-navy'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ready ? 'bg-teal' : 'bg-[#b58b4b]'}`} />
      {status.label}
    </span>
  )
}

function EmptyOrders() {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-soft/35 bg-white px-6 py-12 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-teal"><Sparkles className="h-6 w-6" /></span>
      <h3 className="mt-5 font-display text-xl font-bold text-navy">Сейчас нет заказов в работе</h3>
      <p className="mx-auto mt-2 max-w-[32rem] text-[0.875rem] leading-relaxed text-slate">Когда вы сдадите вещи в «Блеск», заказ появится здесь автоматически.</p>
      <Link href="/#zapis" className="mt-6 inline-flex h-11 items-center rounded-full bg-navy px-5 font-display text-[0.8125rem] font-bold text-white">Записаться онлайн</Link>
    </div>
  )
}

function ItemCard({ item, orderId, index }: { item: OrderItem; orderId: string; index: number }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white transition hover:border-slate-soft/45">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-4 text-left sm:px-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mist text-teal"><Shirt className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-[0.9375rem] font-bold text-navy">{item.name}</span>
          <span className="mt-0.5 block text-[0.75rem] text-slate-soft">Позиция {index + 1}</span>
        </span>
        <span className="hidden sm:block"><StatusPill status={item.status} /></span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-soft transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-line px-4 py-5 sm:px-5">
          <div className="mb-4 sm:hidden"><StatusPill status={item.status} /></div>
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <p className="label text-slate-soft">Отметки при приёмке</p>
              {item.details.length ? (
                <dl className="mt-3 grid gap-x-7 gap-y-2.5 sm:grid-cols-2">
                  {item.details.map((detail, detailIndex) => (
                    <div key={`${detail.label}-${detailIndex}`} className="border-b border-line/70 pb-2">
                      <dt className="text-[0.6875rem] text-slate-soft">{detail.label}</dt>
                      <dd className="mt-0.5 text-[0.8125rem] font-medium text-navy">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : <p className="mt-3 text-[0.8125rem] text-slate">Дополнительных отметок нет.</p>}
            </div>
            <div className="min-w-28 md:text-right">
              <p className="label text-slate-soft">Стоимость</p>
              <p className="mt-2 font-display text-lg font-bold text-navy">{money(item.price)}</p>
            </div>
          </div>

          {item.photos.length > 0 && (
            <div className="mt-5 border-t border-line pt-5">
              <p className="mb-3 flex items-center gap-2 text-[0.75rem] font-semibold text-slate"><Camera className="h-4 w-4 text-teal" /> Фото при приёмке</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {item.photos.map((photo) => (
                  <a key={photo.id} href={`/api/v1/cabinet/photos/${photo.id}?service=${photo.service_id}`} target="_blank" className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-mist">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/v1/cabinet/photos/${photo.id}?service=${photo.service_id}`} alt={`Фото позиции «${item.name}» из заказа ${orderId}`} className="h-full w-full object-cover transition hover:scale-105" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

function CurrentOrder({ order }: { order: Order }) {
  const ready = order.status.code === 'ready'
  return (
    <article className="overflow-hidden rounded-[2rem] bg-navy text-white shadow-[0_18px_60px_rgba(14,26,53,.10)]">
      <div className="grid lg:grid-cols-[1.2fr_.8fr]">
        <div className="p-5 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="label text-teal">Текущий заказ · № {order.number}</p>
            <StatusPill status={order.status} />
          </div>
          <h2 className="mt-7 max-w-[18ch] font-display text-[clamp(1.8rem,4vw,3.2rem)] leading-[1.02] font-bold tracking-[-.04em]">
            {ready ? 'Можно забирать вещи' : 'Мы заботимся о ваших вещах'}
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            <div><p className="text-[0.6875rem] text-white/42">Приняли</p><p className="mt-1 text-[0.875rem] font-semibold">{order.created_at || '—'}</p></div>
            <div><p className="text-[0.6875rem] text-white/42">Плановая готовность</p><p className="mt-1 text-[0.875rem] font-semibold">{order.ready_at || 'Уточняется'}</p></div>
            <div><p className="text-[0.6875rem] text-white/42">Сумма заказа</p><p className="mt-1 text-[0.875rem] font-semibold">{money(order.amount)}</p></div>
          </div>
        </div>
        <div className="border-t border-white/10 bg-white/[.045] p-5 sm:p-8 lg:border-t-0 lg:border-l lg:p-10">
          <p className="label text-white/45">Путь заказа</p>
          <div className="mt-6 space-y-0">
            {[
              ['Заказ принят', true],
              ['Вещи в работе', true],
              ['Готово к выдаче', ready],
            ].map(([label, done], index) => (
              <div key={String(label)} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${done ? 'border-teal bg-teal text-white' : 'border-white/20 text-transparent'}`}>{done && <Check className="h-3.5 w-3.5" />}</span>
                  {index < 2 && <span className={`h-9 w-px ${done ? 'bg-teal' : 'bg-white/15'}`} />}
                </div>
                <p className={`pt-0.5 text-[0.8125rem] ${done ? 'font-semibold text-white' : 'text-white/38'}`}>{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-7 flex gap-3 rounded-2xl border border-white/10 p-4">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
            <div><p className="text-[0.6875rem] text-white/40">Пункт выдачи</p><p className="mt-1 text-[0.8125rem] font-semibold">ул. Энергетическая, 9</p></div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-cream p-4 text-navy sm:p-6 lg:p-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div><p className="label text-teal">Изделия в заказе</p><p className="mt-1 text-[0.8125rem] text-slate">{order.items.length} {order.items.length === 1 ? 'позиция' : 'позиции'}</p></div>
          <span className="rounded-full bg-white px-3 py-1.5 text-[0.6875rem] font-semibold text-slate">Данные AGBIS</span>
        </div>
        <div className="grid gap-3">{order.items.map((item, index) => <ItemCard key={item.id || index} item={item} index={index} orderId={order.number} />)}</div>
      </div>
    </article>
  )
}

function HistoryView({ orders }: { orders: Order[] }) {
  return (
    <section>
      <p className="label text-teal">Архив</p>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-[-.03em] text-navy sm:text-4xl">История заказов</h2>
      <p className="mt-3 text-[0.875rem] text-slate">Заказы за последний год по данным AGBIS.</p>
      <div className="mt-8 grid gap-3">
        {orders.length ? orders.map((order) => (
          <article key={order.id} className="grid gap-4 rounded-2xl border border-line bg-white p-5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-6">
            <div><p className="font-display text-base font-bold text-navy">Заказ № {order.number}</p><p className="mt-1 text-[0.75rem] text-slate-soft">{order.created_at} · {order.items.length} поз.</p></div>
            <StatusPill status={order.status} />
            <p className="font-display text-base font-bold text-navy sm:min-w-28 sm:text-right">{money(order.amount)}</p>
          </article>
        )) : <EmptyOrders />}
      </div>
    </section>
  )
}

function Toggle({ checked, onChange, label, note, icon: Icon }: { checked: boolean; onChange: (value: boolean) => void; label: string; note: string; icon: typeof Bell }) {
  return (
    <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-line p-4 sm:p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mist text-teal"><Icon className="h-5 w-5" /></span>
      <span className="min-w-0 flex-1"><span className="block font-display text-[0.9375rem] font-bold text-navy">{label}</span><span className="mt-0.5 block text-[0.75rem] leading-snug text-slate">{note}</span></span>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="relative h-7 w-12 shrink-0 rounded-full bg-line transition peer-checked:bg-teal after:absolute after:top-1 after:left-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:after:translate-x-5" />
    </label>
  )
}

function SettingsView({ dashboard, onSaved }: { dashboard: Dashboard; onSaved: (prefs: Dashboard['preferences']) => void }) {
  const [prefs, setPrefs] = useState(dashboard.preferences)
  const [saving, setSaving] = useState(false)
  const [pushSaving, setPushSaving] = useState(false)
  const [message, setMessage] = useState('')
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage('')
    try {
      const response = await fetch('/api/v1/cabinet/preferences', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(prefs) })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message || 'Не удалось сохранить настройки.')
      onSaved(prefs); setMessage('Настройки сохранены.')
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Не удалось сохранить настройки.') }
    finally { setSaving(false) }
  }

  async function changePush(enabled: boolean) {
    setPushSaving(true); setMessage('')
    try {
      await updatePushSubscription(enabled)
      const next = { ...prefs, push_notifications: enabled }
      const response = await fetch('/api/v1/cabinet/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(next),
      })
      if (!response.ok) throw new Error('Не удалось сохранить настройку push.')
      setPrefs(next)
      onSaved(next)
      setMessage(enabled ? 'Push-уведомления подключены.' : 'Push-уведомления выключены.')
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Не удалось изменить push-настройку.')
    } finally {
      setPushSaving(false)
    }
  }
  return (
    <section>
      <p className="label text-teal">Профиль</p>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-[-.03em] text-navy sm:text-4xl">Уведомления</h2>
      <p className="mt-3 max-w-[42rem] text-[0.875rem] leading-relaxed text-slate">Телефон используется только для входа и SMS от AGBIS. Почту можно добавить здесь по желанию.</p>
      <form onSubmit={save} className="mt-8 max-w-[42rem] rounded-[1.75rem] bg-white p-5 shadow-[0_16px_50px_rgba(14,26,53,.06)] sm:p-7">
        <div className="grid gap-3">
          <Toggle checked={prefs.push_notifications} onChange={(value) => { if (!pushSaving) void changePush(value) }} label="Push-уведомления" note={pushSaving ? 'Подключаем браузер…' : 'Сообщим, когда статус заказа изменится.'} icon={Bell} />
          <Toggle checked={prefs.email_notifications} onChange={(value) => setPrefs({ ...prefs, email_notifications: value })} label="Уведомления на почту" note="Сейчас сохраняем выбор; отправка временно работает в режиме журнала." icon={Mail} />
        </div>
        {prefs.email_notifications && (
          <div className="mt-5">
            <label htmlFor="cabinet-email" className="label mb-2.5 block text-slate">Электронная почта</label>
            <input id="cabinet-email" type="email" required value={prefs.email ?? ''} onChange={(event) => setPrefs({ ...prefs, email: event.target.value })} placeholder="name@example.ru" className="h-12 w-full rounded-xl border border-line px-4 text-[0.9375rem] text-navy focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10" />
          </div>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-full bg-navy px-5 font-display text-[0.8125rem] font-bold text-white disabled:opacity-60">{saving && <LoaderCircle className="h-4 w-4 animate-spin" />} Сохранить</button>
          {message && <p role="status" className="text-[0.8125rem] font-medium text-slate">{message}</p>}
        </div>
      </form>
    </section>
  )
}

export function CabinetDashboard() {
  const router = useRouter()
  const [data, setData] = useState<Dashboard | null>(null)
  const [view, setView] = useState<View>('orders')
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    setRefreshing(true); setError('')
    try {
      const response = await fetch('/api/v1/cabinet/dashboard', { headers: { Accept: 'application/json' }, cache: 'no-store' })
      if (response.status === 401) return router.replace('/vhod')
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message || 'Не удалось загрузить кабинет.')
      setData(payload)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Не удалось загрузить кабинет.') }
    finally { setRefreshing(false) }
  }

  useEffect(() => { void load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const greeting = useMemo(() => firstName(data?.profile.name ?? null), [data?.profile.name])

  async function logout() {
    await fetch('/api/v1/cabinet/logout', { method: 'POST', headers: { Accept: 'application/json' } }).catch(() => null)
    router.replace('/vhod'); router.refresh()
  }

  if (!data) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-cream px-5">
        <div className="text-center">{error ? <><CircleHelp className="mx-auto h-8 w-8 text-teal" /><p className="mt-4 text-sm text-slate">{error}</p><button onClick={load} className="mt-5 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white">Повторить</button></> : <><LoaderCircle className="mx-auto h-7 w-7 animate-spin text-teal" /><p className="mt-4 text-sm text-slate">Загружаем ваши заказы…</p></>}</div>
      </main>
    )
  }

  const nav = [
    { id: 'orders' as const, label: 'Мои заказы', icon: Package },
    { id: 'history' as const, label: 'История', icon: History },
    { id: 'settings' as const, label: 'Настройки', icon: Settings },
  ]

  return (
    <main className="min-h-svh bg-cream lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden min-h-svh flex-col bg-navy px-6 py-8 text-white lg:sticky lg:top-0 lg:flex lg:h-svh">
        <Link href="/" aria-label="Блеск — на главную"><Image src="/brand/logo-h-white.svg" alt="Блеск" width={1701} height={482} className="h-9 w-auto" priority /></Link>
        <nav className="mt-16 grid gap-2">
          {nav.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setView(id)} className={`flex h-12 items-center gap-3 rounded-xl px-4 text-left text-[0.8125rem] font-semibold transition ${view === id ? 'bg-white text-navy' : 'text-white/55 hover:bg-white/6 hover:text-white'}`}><Icon className={`h-4 w-4 ${view === id ? 'text-teal' : ''}`} />{label}</button>)}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 p-4"><p className="text-[0.6875rem] text-white/35">Нужна помощь?</p><a href="tel:+79166959179" className="mt-1 block text-[0.8125rem] font-semibold">+7 (916) 695-91-79</a><p className="mt-1 text-[0.6875rem] text-white/35">Ежедневно, 9:00–20:00</p></div>
        <button onClick={logout} className="mt-4 flex items-center gap-2 px-2 text-[0.75rem] font-semibold text-white/45 hover:text-white"><LogOut className="h-4 w-4" /> Выйти</button>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line/80 bg-cream/95 px-4 py-4 backdrop-blur sm:px-7 lg:px-10">
          <Image src="/brand/logo-h-navy.svg" alt="Блеск" width={1701} height={482} className="h-7 w-auto lg:hidden" priority />
          <div className="hidden lg:block"><p className="text-[0.75rem] text-slate-soft">Личный кабинет</p><p className="font-display text-[0.875rem] font-bold text-navy">{data.profile.phone}</p></div>
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={refreshing} aria-label="Обновить данные" className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-slate hover:text-teal"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /></button>
            <button onClick={logout} aria-label="Выйти" className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-slate hover:text-navy lg:hidden"><LogOut className="h-4 w-4" /></button>
            <span className="hidden h-10 items-center rounded-full bg-white px-4 text-[0.75rem] font-semibold text-navy shadow-sm sm:flex">{greeting || 'Клиент «Блеска»'}</span>
          </div>
        </header>

        <nav className="scrollbar-none flex gap-2 overflow-x-auto border-b border-line bg-white px-4 py-3 lg:hidden">
          {nav.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setView(id)} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[0.75rem] font-semibold ${view === id ? 'bg-navy text-white' : 'bg-mist text-slate'}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}
        </nav>

        <div className="mx-auto max-w-[82rem] px-4 py-7 sm:px-7 sm:py-10 lg:px-10 lg:py-12">
          {error && <div className="mb-6 rounded-xl border border-destructive/20 bg-white px-4 py-3 text-[0.8125rem] text-destructive">{error}</div>}
          {view === 'orders' && <section><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="label text-teal">Добрый день{greeting ? `, ${greeting}` : ''}</p><h1 className="mt-3 font-display text-3xl font-bold tracking-[-.035em] text-navy sm:text-5xl">Ваши заказы</h1></div><div className="flex items-center gap-2 text-[0.75rem] text-slate-soft"><Clock3 className="h-4 w-4 text-teal" /> Данные обновляются из AGBIS</div></div><div className="grid gap-6">{data.orders.length ? data.orders.map((order) => <CurrentOrder key={order.id} order={order} />) : <EmptyOrders />}</div></section>}
          {view === 'history' && <HistoryView orders={data.history} />}
          {view === 'settings' && <SettingsView dashboard={data} onSaved={(preferences) => setData({ ...data, preferences })} />}
        </div>
      </div>
    </main>
  )
}
