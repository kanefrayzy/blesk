import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 })
  const { thumbnail } = await import('@/lib/photoFitter')
  try {
    const buffer = await thumbnail(request.nextUrl.searchParams.get('file') ?? '')
    return new Response(new Uint8Array(buffer), {
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, max-age=3600' },
    })
  } catch {
    return new Response(null, { status: 404 })
  }
}
