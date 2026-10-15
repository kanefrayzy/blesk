import { cache } from 'react'
import { fallbackContent } from '@/lib/cmsFallback'
import type { SiteContent } from '@/lib/cmsTypes'

const API = process.env.BLESK_API_URL ?? 'http://127.0.0.1:8010/api/v1'

/** Без сигнала из панели витрина перечитывает контент раз в пять минут. */
const REVALIDATE = 300

export const CONTENT_TAG = 'content'

const PLACEHOLDER = '/photo/prod-oborudovanie.jpg'

/** Те же источники, что разрешены оптимизатору картинок в next.config. */
const allowedOrigins = new Set(['https://bleskvip.ru', new URL(API).origin])

function photo(value: unknown, fallback = PLACEHOLDER): string {
  if (typeof value !== 'string' || value === '') return fallback
  try {
    const url = new URL(value)
    if (!allowedOrigins.has(url.origin) || !url.pathname.startsWith('/storage/') || url.pathname.includes('..')) return fallback
    return url.toString()
  } catch {
    return fallback
  }
}

/** Фото внутри страниц лежат в полях src и photo. */
function photosIn<T>(value: T): T {
  if (Array.isArray(value)) return value.map(photosIn) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, (k === 'src' || k === 'photo') && (typeof v === 'string' || v == null) ? photo(v) : photosIn(v)]),
    ) as T
  }
  return value
}

/** Из ответа берём только списки; фото в них проверяем, запасной контент — как есть. */
function list<T>(value: unknown, fallback: T[], fix: (item: T) => T): T[] {
  return Array.isArray(value) ? (value as T[]).map(fix) : fallback
}

function normalize(raw: Partial<Record<keyof SiteContent, unknown>>): SiteContent {
  const f = fallbackContent
  const slides = list(raw.heroSlides, f.heroSlides, (s) => ({ ...s, photo: photo(s.photo), photoMobile: photo(s.photoMobile, photo(s.photo)) }))

  return {
    services: list(raw.services, f.services, (s) => ({
      ...s,
      cardPhoto: photo(s.cardPhoto),
      heroPhoto: photo(s.heroPhoto),
      processPhoto: photo(s.processPhoto),
    })),
    // Первый экран без слайдов не собрать — тогда показываем стандартные.
    heroSlides: slides.length ? slides : f.heroSlides,
    production: list(raw.production, f.production, (p) => ({ ...p, photo: photo(p.photo) })),
    vacancies: list(raw.vacancies, f.vacancies, (v) => ({ ...v, photo: photo(v.photo) })),
    dealerPage: { ...f.dealerPage, ...photosIn((raw.dealerPage ?? {}) as object) },
    vacanciesPage: { ...f.vacanciesPage, ...photosIn((raw.vacanciesPage ?? {}) as object) },
  }
}

export const getContent = cache(async (): Promise<SiteContent> => {
  try {
    const res = await fetch(`${API}/content`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE, tags: [CONTENT_TAG] },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return fallbackContent

    const payload = (await res.json()) as { data?: Partial<Record<keyof SiteContent, unknown>> }
    return payload.data ? normalize(payload.data) : fallbackContent
  } catch {
    return fallbackContent
  }
})
