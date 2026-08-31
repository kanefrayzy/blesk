/**
 * Чтение материалов из админки на Laravel.
 *
 * Витрина статическая: страницы пересобираются по расписанию, а не на каждый
 * запрос — редактор публикует раз в несколько дней, держать ради этого живой
 * запрос к бэкенду незачем.
 */

const API = process.env.BLESK_API_URL ?? 'http://127.0.0.1:8010/api/v1'

/** Как часто Next перепроверяет материалы, секунды. */
const REVALIDATE = 300

export type PostSummary = {
  slug: string
  title: string
  excerpt: string
  rubric: string
  rubric_label: string
  cover_url: string | null
  cover_alt: string | null
  published_at: string | null
  reading_minutes: number
}

export type Post = PostSummary & {
  body: string
  seo_title: string | null
  seo_description: string | null
  updated_at: string | null
}

async function read<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE, tags: ['posts'] },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    // Бэкенд недоступен — раздел показывает пустое состояние, а не падает.
    return null
  }
}

export async function getPosts(rubric?: string): Promise<PostSummary[]> {
  const query = rubric ? `?rubric=${encodeURIComponent(rubric)}&per_page=48` : '?per_page=48'
  const data = await read<{ data: PostSummary[] }>(`/posts${query}`)
  return data?.data ?? []
}

export async function getPost(slug: string): Promise<Post | null> {
  const data = await read<{ data: Post }>(`/posts/${encodeURIComponent(slug)}`)
  return data?.data ?? null
}

/** Дата материала по-русски, во времени Жуковского. */
export function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Moscow',
  }).format(new Date(iso))
}

export function minutesLabel(n: number): string {
  const tail = n % 10
  const teen = n % 100
  if (teen >= 11 && teen <= 14) return `${n} минут`
  if (tail === 1) return `${n} минута`
  if (tail >= 2 && tail <= 4) return `${n} минуты`
  return `${n} минут`
}
