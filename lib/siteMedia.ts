/**
 * Фотографии мест сайта, заменённые в админке. Чего здесь нет — показывается
 * стандартный снимок из public/photo, поэтому сбой бэкенда главную не ломает.
 *
 * Список мест и их ключи — в backend/app/Support/SiteMediaSlots.php.
 */

import type { SiteMedia, SiteMediaItem } from '@/lib/siteMediaTypes'

const API = process.env.BLESK_API_URL ?? 'http://127.0.0.1:8010/api/v1'

/** Без сигнала из админки витрина перечитывает фото раз в пять минут. */
const REVALIDATE = 300

export const SITE_MEDIA_TAG = 'site-media'

/**
 * Пускаем только адреса из хранилища админки — те же, что разрешены
 * оптимизатору картинок в next.config. Чужой адрес next/image не отрисует
 * и уронит страницу, поэтому его просто не берём.
 */
const allowedOrigins = new Set(['https://bleskvip.ru', new URL(API).origin])

function safeUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value === '') return null
  try {
    const url = new URL(value)
    if (!allowedOrigins.has(url.origin)) return null
    if (!url.pathname.startsWith('/storage/site-media/') || url.pathname.includes('..')) return null
    return url.toString()
  } catch {
    return null
  }
}

function safeAlt(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim().slice(0, 180) : null
}

export async function getSiteMedia(): Promise<SiteMedia> {
  try {
    const res = await fetch(`${API}/site-media`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE, tags: [SITE_MEDIA_TAG] },
      // Зависший бэкенд не должен держать главную: лучше стандартные фото.
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return {}

    const payload = (await res.json()) as { data?: Record<string, Record<string, unknown>> }
    const media: SiteMedia = {}

    for (const [key, raw] of Object.entries(payload.data ?? {})) {
      if (!raw || typeof raw !== 'object') continue
      const item: SiteMediaItem = {
        src: safeUrl(raw.src),
        srcMobile: safeUrl(raw.src_mobile),
        alt: safeAlt(raw.alt),
      }
      if (item.src || item.srcMobile || item.alt) media[key] = item
    }

    return media
  } catch {
    return {}
  }
}
