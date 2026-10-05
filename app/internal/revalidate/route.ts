import { timingSafeEqual } from 'node:crypto'
import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { SITE_MEDIA_TAG } from '@/lib/siteMedia'

/**
 * Админка зовёт сюда после замены фото, чтобы сайт показал его сразу, а не
 * когда истечёт кэш. Ходит напрямую на порт витрины, но адрес доступен и
 * снаружи — поэтому без секрета ничего не делаем.
 */
const TAGS = new Set([SITE_MEDIA_TAG])

function sameSecret(given: string, expected: string): boolean {
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) return Response.json({ ok: false }, { status: 503 })

  if (!sameSecret(request.headers.get('x-revalidate-secret') ?? '', secret)) {
    return Response.json({ ok: false }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as { tag?: unknown } | null
  const tag = typeof body?.tag === 'string' ? body.tag : ''
  if (!TAGS.has(tag)) return Response.json({ ok: false }, { status: 400 })

  // Вызов извне: данные нужны свежие сразу, а не на следующем заходе.
  revalidateTag(tag, { expire: 0 })

  return Response.json({ ok: true })
}
